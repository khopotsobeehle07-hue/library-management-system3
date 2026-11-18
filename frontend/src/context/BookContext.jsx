import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";

const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");

  const loadBooks = useCallback(async () => {
    setLoadingBooks(true);
    setBooksError("");
    try {
      const loadedBooks = await api.get("/books");
      setBooks(Array.isArray(loadedBooks) ? loadedBooks : []);
    } catch (err) {
      setBooksError(err.message || "Unable to reach the backend.");
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    setTransactionsError("");
    try {
      const loadedTransactions = await api.get("/transactions");
      setTransactions(Array.isArray(loadedTransactions) ? loadedTransactions : []);
    } catch (err) {
      setTransactionsError(err.message || "Unable to reach the backend.");
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadBooks);
    void Promise.resolve().then(loadTransactions);
  }, [loadBooks, loadTransactions]);

  const addBook = async (book) => {
    try {
      await api.post("/books", book);
      await loadBooks();
      return null;
    } catch (err) {
      return err.message || "Unable to add book.";
    }
  };

  const updateBook = async (id, updates) => {
    const current = books.find((b) => b.id === id);
    if (!current) return "Book not found.";
    try {
      await api.put(`/books/${id}`, { ...current, ...(updates || {}) });
      await loadBooks();
      return null;
    } catch (err) {
      return err.message || "Unable to update book.";
    }
  };

  const deleteBook = async (id) => {
    try {
      await api.remove(`/books/${id}`);
      await Promise.all([loadBooks(), loadTransactions()]);
      return null;
    } catch (err) {
      return err.message || "Unable to delete book.";
    }
  };

  const recordTransaction = async ({ bookId, type, quantity, member, recordedBy }) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return "Book not found.";
    if (type === "borrow" && quantity > book.quantity) {
      return `Not enough stock. Only ${book.quantity} in stock.`;
    }

    try {
      await api.post("/transactions", { bookId, type, quantity, member, recordedBy });
      await Promise.all([loadBooks(), loadTransactions()]);
      return null;
    } catch (err) {
      return err.message || "Unable to record transaction.";
    }
  };

  return (
    <BooksContext.Provider
      value={{
        books,
        loadingBooks,
        booksError,
        addBook,
        updateBook,
        deleteBook,
        transactions,
        loadingTransactions,
        transactionsError,
        recordTransaction,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  return useContext(BooksContext);
}