import { 
  doc, 
  runTransaction, 
  increment, 
  Timestamp, 
  collection, 
  setDoc, 
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Transaction, TransactionType, TransactionStatus, UserLevel } from '../types';
import { PACKAGES, LEVELS, MILESTONES } from '../constants';

export const referralService = {
  async processReferral(recruiterUid: string, recruitUid: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const recruiterRef = doc(db, 'users', recruiterUid);
        const recruiterSnap = await transaction.get(recruiterRef);
        
        if (!recruiterSnap.exists()) return;
        
        const recruiter = recruiterSnap.data() as User;
        const packageInfo = PACKAGES.find(p => p.amount === recruiter.packageAmount);
        const bonus = packageInfo ? packageInfo.bonus : 0;

        // 1. Credit referral bonus to recruiter
        transaction.update(recruiterRef, {
          walletBalance: increment(bonus),
          totalEarned: increment(bonus),
          directReferrals: increment(1),
          teamSize: increment(1),
          dailyRecruitCount: increment(1),
        });

        // 2. Create referral bonus transaction
        const txnId = `txn_${Date.now()}_${recruiterUid}`;
        const txnRef = doc(db, 'transactions', txnId);
        const txn: Transaction = {
          txnId,
          userId: recruiterUid,
          type: 'referral_bonus',
          amount: bonus,
          status: 'completed',
          description: `Referral bonus for recruiting new member`,
          createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0).toDate().toISOString(),
        };
        transaction.set(txnRef, txn);

        // 3. Bubble up team size increment to all ancestors
        let currentParentCode = recruiter.referredBy;
        let depth = 0;
        while (currentParentCode && depth < 20) { // Safety limit
          const parentQuery = query(collection(db, 'users'), where('referralCode', '==', currentParentCode));
          const parentSnap = await getDocs(parentQuery);
          
          if (parentSnap.empty) break;
          
          const parentDoc = parentSnap.docs[0];
          const parentRef = doc(db, 'users', parentDoc.id);
          const parentData = parentDoc.data() as User;
          
          transaction.update(parentRef, {
            teamSize: increment(1)
          });

          // Check for level upgrade for parent
          const newTeamSize = parentData.teamSize + 1;
          let newLevel: UserLevel = parentData.level;
          if (newTeamSize >= LEVELS.diamond.minTeam) newLevel = 'diamond';
          else if (newTeamSize >= LEVELS.gold.minTeam) newLevel = 'gold';
          else if (newTeamSize >= LEVELS.silver.minTeam) newLevel = 'silver';
          
          if (newLevel !== parentData.level) {
            transaction.update(parentRef, { level: newLevel });
          }

          // Check for milestones
          for (const milestone of MILESTONES) {
            if (newTeamSize >= milestone.teamSize && !parentData.milestonesReached.includes(milestone.teamSize)) {
              // Credit milestone bonus
              transaction.update(parentRef, {
                walletBalance: increment(milestone.bonus),
                totalEarned: increment(milestone.bonus),
                milestonesReached: [...parentData.milestonesReached, milestone.teamSize]
              });
              
              const mTxnId = `milestone_${Date.now()}_${parentDoc.id}_${milestone.teamSize}`;
              const mTxnRef = doc(db, 'transactions', mTxnId);
              transaction.set(mTxnRef, {
                txnId: mTxnId,
                userId: parentDoc.id,
                type: 'monthly_bonus',
                amount: milestone.bonus,
                status: 'completed',
                description: `Milestone bonus for reaching ${milestone.teamSize} team members`,
                createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0).toDate().toISOString(),
              });
            }
          }

          currentParentCode = parentData.referredBy;
          depth++;
        }

        // 4. Check for daily recruitment bonus for recruiter
        const newDailyCount = recruiter.dailyRecruitCount + 1;
        let dailyBonus = 0;
        if (newDailyCount === 1) dailyBonus = 50;
        else if (newDailyCount === 2) dailyBonus = 50; // Total 100
        else if (newDailyCount === 3) dailyBonus = 50; // Total 150
        
        if (dailyBonus > 0) {
          transaction.update(recruiterRef, {
            walletBalance: increment(dailyBonus),
            totalEarned: increment(dailyBonus),
          });
          
          const dTxnId = `daily_${Date.now()}_${recruiterUid}_${newDailyCount}`;
          const dTxnRef = doc(db, 'transactions', dTxnId);
          transaction.set(dTxnRef, {
            txnId: dTxnId,
            userId: recruiterUid,
            type: 'daily_bonus',
            amount: dailyBonus,
            status: 'completed',
            description: `Daily bonus for ${newDailyCount} recruits today`,
            createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0).toDate().toISOString(),
          });
        }
      });
    } catch (error) {
      console.error('Error processing referral:', error);
      throw error;
    }
  }
};
