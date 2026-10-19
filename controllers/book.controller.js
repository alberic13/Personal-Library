'use strict';

const BookService = require('../services/book.service');

const BookController = {
  async getAllBooks(req, res) {
    try {
      const books = await BookService.getAllBooks();
      return res.json(books);
    } catch (err) {
      return res.status(500).send('server error');
    }
  },

  async createBook(req, res) {
    try {
      const { title } = req.body;
      const newBook = await BookService.createBook(title);
      return res.json(newBook);
    } catch (err) {
      if (err.message === 'missing required field title') {
        return res.send('missing required field title');
      }
      return res.status(500).send('server error');
    }
  },

  async deleteAllBooks(req, res) {
    try {
      const message = await BookService.deleteAllBooks();
      return res.send(message);
    } catch (err) {
      return res.status(500).send('server error');
    }
  },

  async getBookById(req, res) {
    try {
      const bookid = req.params.id;
      const book = await BookService.getBookById(bookid);
      return res.json(book);
    } catch (err) {
      if (err.message === 'no book exists') {
        return res.send('no book exists');
      }
      return res.status(500).send('server error');
    }
  },

  async addComment(req, res) {
    try {
      const bookid = req.params.id;
      const { comment } = req.body;
      const updated = await BookService.addComment(bookid, comment);
      return res.json(updated);
    } catch (err) {
      if (err.message === 'missing required field comment' || err.message === 'no book exists') {
        return res.send(err.message);
      }
      return res.status(500).send('server error');
    }
  },

  async deleteBookById(req, res) {
    try {
      const bookid = req.params.id;
      const message = await BookService.deleteBookById(bookid);
      return res.send(message);
    } catch (err) {
      if (err.message === 'no book exists') {
        return res.send('no book exists');
      }
      return res.status(500).send('server error');
    }
  }
};

module.exports = BookController;
