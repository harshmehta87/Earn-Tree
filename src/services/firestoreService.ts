import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Transaction, WithdrawalRequest, AdminSettings, TransactionType, TransactionStatus } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  // User operations
  async getUser(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as User : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async getUserByReferralCode(code: string): Promise<User | null> {
    try {
      const q = query(collection(db, 'users'), where('referralCode', '==', code), limit(1));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty ? querySnapshot.docs[0].data() as User : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return null;
    }
  },

  async createUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.uid), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
  },

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Transaction operations
  async createTransaction(txn: Transaction): Promise<void> {
    try {
      await setDoc(doc(db, 'transactions', txn.txnId), txn);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${txn.txnId}`);
    }
  },

  getRecentTransactions(userId: string, callback: (txns: Transaction[]) => void) {
    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
    return onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(doc => doc.data() as Transaction);
      callback(txns);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });
  },

  // Withdrawal operations
  async createWithdrawalRequest(request: WithdrawalRequest): Promise<void> {
    try {
      await setDoc(doc(db, 'withdrawalRequests', request.requestId), request);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `withdrawalRequests/${request.requestId}`);
    }
  },

  // Admin operations
  getAdminSettings(callback: (settings: AdminSettings) => void) {
    return onSnapshot(doc(db, 'adminSettings', 'global'), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as AdminSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'adminSettings/global');
    });
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'withdrawalRequests'));
      return querySnapshot.docs.map(doc => doc.data() as WithdrawalRequest);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'withdrawalRequests');
      return [];
    }
  }
};
