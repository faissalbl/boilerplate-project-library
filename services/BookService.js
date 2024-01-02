const Book = require('../models/Book');

async function createBook(title) {
    if (!title) throw new Error('missing required field title');
    const book = new Book({ title });
    return await book.save(); 
}

async function getBooks(filter) {
    const selection = ['_id', 'title', 'commentcount'];
    const books = await Book.find(filter, selection);
    return books;
}

async function getBookById(id) {
    if (!id) throw new Error('missing required field _id');
    const selection = ['_id', 'title', 'comments'];
    const book = await Book.findById(id, selection);
    return book;
}

async function addComment(id, comment) {
    if (!id) throw new Error('missing required field _id');
    if (!comment) throw new Error('missing required field comment');
    const select = { _id: 1, title: 1, comments: 1 };
    const book = await Book.findByIdAndUpdate(id, { $push: { comments: comment } }, { new: true, useFindAndModify: false, select });
    return book;
}

async function deleteBook(id) {
    if (!id) throw new Error('missing required field _id');
    const deletedBook = await Book.findByIdAndDelete(id);
    return deletedBook;
}

async function deleteAllBooks() {
    const { deletedCount } = await Book.deleteMany();
    return deletedCount;
}

module.exports = {
    getBooks, getBookById, createBook, deleteBook, deleteAllBooks, addComment,
};