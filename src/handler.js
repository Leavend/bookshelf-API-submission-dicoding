const { nanoid } = require('nanoid');
const bookshelf = require('./books.js');

const saveBooks = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  const id = nanoid(16);

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if(!name || name === undefined || name === null || name === '') {
    const response = h.response({
      status: 'fail',
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response; 
  }
  
  if(readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }
  const isFinish =  (pageCount, readPage) => {
    if(pageCount === readPage) {
      return true;
    } else {
      return false;
    }
  };

  const finished = isFinish(pageCount, readPage);

  const newBooks = {
    name, year, author, summary, publisher, pageCount, readPage, reading, id, finished, insertedAt, updatedAt
  };

  bookshelf.push(newBooks);
  
  const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;

  if(isSuccess) {
    const response = h.response({
      status: 'success',
      message: "Buku berhasil ditambahkan",
      data: {
        bookId : id,  
      }
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooks = (request, h) => {
  const { name, reading, finished } = request.query;
  
  if (!bookshelf) {
    const response = h.response({
      status: 'success',
      data: {
        books: [],
      }
    });
    response.code(200);
    return response;
  }

  let screeningBooks = bookshelf;

  if (name) {
    screeningBooks = bookshelf.filter((b) =>
      b.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (reading) {
    screeningBooks = bookshelf.filter((b) => Number(b.reading) === Number(reading));
  }

  if (finished) {
    screeningBooks = bookshelf.filter(
      (b) => Number(b.finished) === Number(finished)
    );
  }

  const listOfMyBooks = screeningBooks.map((b) => ({
    id: b.id,
    name: b.name,
    publisher: b.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: listOfMyBooks,
    }
  });
  response.code(200);
  return response;
}

const getBookById = (request, h) => {
  const { bookId } = request.params;

  const book = bookshelf.filter((b) => b.id === bookId)[0];
  if(book !== undefined) {
    return {
      status: 'success',
      data : {
        book, 
      }
    }
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  })
  response.code(404);
  return response;
};

const editBookById = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if(name === undefined || name === null || name === '') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    })
    response.code(400);
    return response;
  };

  if(readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    })
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();

  const index = bookshelf.findIndex((book) => book.id === bookId);

  if(index !== -1){
    bookshelf[index] = {
      ...bookshelf[index],
      name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt,
    };
    const response = h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui'
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan'
  })
  response.code(404);
  return response;
};

const deleteBookById = (request, h) => {
  const { bookId } = request.params;

  const index = bookshelf.findIndex((book) => book.id === bookId);

  if(index !== -1){
    bookshelf.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
}
 
module.exports = { saveBooks, getAllBooks, getBookById, editBookById, deleteBookById };