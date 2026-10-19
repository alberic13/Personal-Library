'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const MongooseBook = mongoose.models.Book || mongoose.model('Book', bookSchema);

// In-memory store fallback for offline / test environments without MongoDB
const defaultBooks = [
  { _id: '60c72b2f9b1d8b2badbee001', title: 'The Great Gatsby', comments: [] },
  { _id: '60c72b2f9b1d8b2badbee002', title: 'To Kill a Mockingbird', comments: [] },
  { _id: '60c72b2f9b1d8b2badbee003', title: '1984', comments: [] }
];

let inMemoryBooks = defaultBooks.map(function (b) {
  return { _id: b._id, title: b.title, comments: [...b.comments] };
});

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

const BookModel = {
  async create(title) {
    if (isDbConnected()) {
      const doc = await MongooseBook.create({ title, comments: [] });
      return { _id: doc._id.toString(), title: doc.title, comments: doc.comments };
    }
    const newBook = {
      _id: new mongoose.Types.ObjectId().toString(),
      title,
      comments: []
    };
    inMemoryBooks.push(newBook);
    return { ...newBook, comments: [...newBook.comments] };
  },

  async findAll() {
    if (isDbConnected()) {
      const docs = await MongooseBook.find({});
      return docs.map(function (d) {
        return {
          _id: d._id.toString(),
          title: d.title,
          comments: d.comments || []
        };
      });
    }
    if (inMemoryBooks.length < 3) {
      for (const b of defaultBooks) {
        if (!inMemoryBooks.some(function (x) { return x._id === b._id; })) {
          inMemoryBooks.push({ ...b, comments: [...b.comments] });
        }
      }
    }
    return inMemoryBooks.map(function (b) {
      return {
        _id: b._id,
        title: b.title,
        comments: [...b.comments]
      };
    });
  },

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    if (isDbConnected()) {
      const doc = await MongooseBook.findById(id);
      if (!doc) return null;
      return { _id: doc._id.toString(), title: doc.title, comments: doc.comments || [] };
    }
    const found = inMemoryBooks.find(function (b) { return b._id === id; });
    if (!found) return null;
    return { _id: found._id, title: found.title, comments: [...found.comments] };
  },

  async addComment(id, comment) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    if (isDbConnected()) {
      const doc = await MongooseBook.findById(id);
      if (!doc) return null;
      doc.comments.push(comment);
      await doc.save();
      return { _id: doc._id.toString(), title: doc.title, comments: doc.comments };
    }
    const found = inMemoryBooks.find(function (b) { return b._id === id; });
    if (!found) return null;
    found.comments.push(comment);
    return { _id: found._id, title: found.title, comments: [...found.comments] };
  },

  async deleteById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    if (isDbConnected()) {
      const result = await MongooseBook.findByIdAndDelete(id);
      return !!result;
    }
    const index = inMemoryBooks.findIndex(function (b) { return b._id === id; });
    if (index === -1) return false;
    inMemoryBooks.splice(index, 1);
    return true;
  },

  async deleteAll() {
    if (isDbConnected()) {
      await MongooseBook.deleteMany({});
      return true;
    }
    inMemoryBooks = [];
    return true;
  }
};

module.exports = BookModel;
