"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, googleProvider, db, verifyFirestoreConnection } from "@/lib/firebase";
import { ArticleDraft, Folder } from "@/types/article";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  folders: Folder[];
  savedArticles: ArticleDraft[];
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  createFolder: (name: string, color?: string) => Promise<Folder>;
  deleteFolder: (folderId: string) => Promise<void>;
  saveArticleToCloud: (article: ArticleDraft) => Promise<void>;
  deleteArticleFromCloud: (articleId: string) => Promise<void>;
  toggleFavoriteArticle: (articleId: string) => Promise<void>;
  assignArticleToFolder: (articleId: string, folderId: string | undefined) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [savedArticles, setSavedArticles] = useState<ArticleDraft[]>([]);

  useEffect(() => {
    verifyFirestoreConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          await setDoc(
            userRef,
            {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "guest@user.local",
              displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Guest Writer" : "Writer"),
              photoURL: firebaseUser.photoURL || "",
              lastSeen: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn("Could not sync user profile to Firestore:", e);
        }
      } else {
        setFolders([]);
        setSavedArticles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const foldersRef = collection(db, "users", user.uid, "folders");
    const unsubFolders = onSnapshot(
      foldersRef,
      (snapshot) => {
        const loaded: Folder[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as Folder);
        });
        setFolders(loaded);
      },
      (err) => {
        console.warn("Error subscribing to folders:", err);
      }
    );

    const articlesRef = collection(db, "users", user.uid, "articles");
    const unsubArticles = onSnapshot(
      articlesRef,
      (snapshot) => {
        const loaded: ArticleDraft[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as ArticleDraft);
        });
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSavedArticles(loaded);
      },
      (err) => {
        console.warn("Error subscribing to articles:", err);
      }
    );

    return () => {
      unsubFolders();
      unsubArticles();
    };
  }, [user]);

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const createFolder = async (name: string, color: string = "#10b981") => {
    if (!user) throw new Error("Must be logged in to create folders");
    const folderId = "folder_" + Date.now();
    const newFolder: Folder = {
      id: folderId,
      userId: user.uid,
      name: name.trim(),
      color: color,
      createdAt: new Date().toISOString(),
    };

    const ref = doc(db, "users", user.uid, "folders", folderId);
    await setDoc(ref, newFolder);
    return newFolder;
  };

  const deleteFolder = async (folderId: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "folders", folderId);
    await deleteDoc(ref);

    const affected = savedArticles.filter((a) => a.folderId === folderId);
    for (const a of affected) {
      const artRef = doc(db, "users", user.uid, "articles", a.id);
      await setDoc(artRef, { ...a, folderId: undefined }, { merge: true });
    }
  };

  const saveArticleToCloud = async (article: ArticleDraft) => {
    if (!user) {
      throw new Error("Must be logged in to save to your cloud account.");
    }
    const ref = doc(db, "users", user.uid, "articles", article.id);
    const payload = {
      ...article,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
  };

  const deleteArticleFromCloud = async (articleId: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "articles", articleId);
    await deleteDoc(ref);
  };

  const toggleFavoriteArticle = async (articleId: string) => {
    if (!user) return;
    const existing = savedArticles.find((a) => a.id === articleId);
    if (!existing) return;
    const ref = doc(db, "users", user.uid, "articles", articleId);
    await setDoc(
      ref,
      { isFavorite: !existing.isFavorite, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const assignArticleToFolder = async (articleId: string, folderId: string | undefined) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "articles", articleId);
    await setDoc(
      ref,
      { folderId: folderId || null, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        folders,
        savedArticles,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        createFolder,
        deleteFolder,
        saveArticleToCloud,
        deleteArticleFromCloud,
        toggleFavoriteArticle,
        assignArticleToFolder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
