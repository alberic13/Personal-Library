'use strict';

const BookModel = require('../models/book.model');

const BookService = {
  async createBook(title) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('missing required field title');
    }
    const book = await BookModel.create(title.trim());
    return { _id: book._id, title: book.title };
  },

  async getAllBooks() {
    const books = await BookModel.findAll();
    return books.map(book => ({
      _id: book._id,
      title: book.title,
      commentcount: Array.isArray(book.comments) ? book.comments.length : 0
    }));
  },

  async getBookById(id) {
    const book = await BookModel.findById(id);
    if (!book) {
      throw new Error('no book exists');
    }
    return {
      _id: book._id,
      title: book.title,
      comments: book.comments || []
    };
  },

  async addComment(id, comment) {
    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      throw new Error('missing required field comment');
    }
    const updated = await BookModel.addComment(id, comment.trim());
    if (!updated) {
      throw new Error('no book exists');
    }
    return {
      _id: updated._id,
      title: updated.title,
      comments: updated.comments || []
    };
  },

  async deleteBookById(id) {
    const deleted = await BookModel.deleteById(id);
    if (!deleted) {
      throw new Error('no book exists');
    }
    return 'delete successful';
  },

  async deleteAllBooks() {
    await BookModel.deleteAll();
    return 'complete delete successful';
  }
};

module.exports = BookService;
