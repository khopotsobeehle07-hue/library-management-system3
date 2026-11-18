CREATE DATABASE IF NOT EXISTS library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  isbn VARCHAR(30) NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  membership_id VARCHAR(30) NOT NULL UNIQUE,
  role ENUM('admin', 'librarian', 'member') NOT NULL
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  book_title VARCHAR(255) NOT NULL,
  type ENUM('borrow', 'add') NOT NULL,
  quantity INT NOT NULL,
  member VARCHAR(150) NOT NULL DEFAULT '',
  recorded_by VARCHAR(150) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

INSERT INTO users (id, name, membership_id, role) VALUES
  (1, 'Khopotso', 'ADMIN001', 'admin'),
  (2, 'David', 'LIB001', 'librarian'),
  (3, 'Carol', 'MEM001', 'member');

INSERT INTO books (id, title, author, genre, isbn, quantity) VALUES
  (1, 'Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5),
  (2, 'Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 11),
  (3, 'A Brief History of Time', 'Stephen Hawking', 'Science', '9780553380163', 3),
  (4, 'The Narrow Path', 'Francis Selormey', 'Fiction', '9780000000004', 43),
  (5, 'Hello Sweet Baby', 'Bruce and Carol Britten', 'Fiction', '9780000000011', 2),
  (6, 'The Ninja', 'James Vance Marshall', 'Fiction', '9780000000028', 3),
  (7, 'Chaka', 'Thomas Mofolo', 'Historical Fiction', '9780000000035', 67),
  (8, 'Weep Not, Child', 'Ngũgĩ wa Thiong''o', 'Fiction', '9780000000042', 5),
  (9, 'Walkabout', 'James Vance Marshall', 'Adventure', '9780141957814', 17),
  (10, 'Half of a Yellow Sun', 'Chimamanda Ngozi Adichie', 'Historical Fiction', '9780000000059', 64),
  (11, 'So Long a Letter', 'Mariama Bâ', 'Fiction', '9780000000066', 34),
  (12, 'Nervous Conditions', 'Tsitsi Dangarembga', 'Fiction', '9780000000073', 2),
  (13, 'Cry, the Beloved Country', 'Alan Paton', 'Fiction', '9780000000080', 58);

INSERT INTO transactions (book_id, book_title, type, quantity, member, recorded_by, created_at) VALUES
  (3, 'A Brief History of Time', 'add', 4, '', 'David', '2026-10-10 14:12:00'),
  (8, 'Weep Not, Child', 'borrow', 1, 'Carol', 'Khopotso', '2026-10-10 15:24:00'),
  (2, 'Clean Code', 'add', 2, '', 'Khopotso', '2026-10-11 19:38:06'),
  (9, 'Walkabout', 'borrow', 2, 'Khopotso', 'David', '2026-10-11 19:39:16'),
  (13, 'Cry, the Beloved Country', 'add', 3, '', 'David', '2026-10-11 19:58:39'),
  (1, 'Things Fall Apart', 'borrow', 1, 'Carol', 'Khopotso', '2026-10-12 16:46:53');