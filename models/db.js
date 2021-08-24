const sqlite3 = require('sqlite3').verbose();
const dbName = 'servers.sqlite';
const db = new sqlite3.Database(dbName);

db.serialize(() => {
  const sql = `
        CREATE TABLE IF NOT EXISTS servers
            (id integer primary key, name, url TEXT)
    `;
  db.run(sql);
  // db.run('CREATE TABLE IF NOT EXISTS rss (id integer primary key, name, url TEXT)');
});

class Server {
  static all(cb) {
    db.all('SELECT * FROM servers', cb);
  }

  static find(id, cb) {
    db.get('SELECT * FROM servers WHERE id = ?', id, cb);
  }

  static create(data, cb) {
    const sql = 'INSERT INTO servers(name, url) VALUES (?, ?)';
    db.run(sql, data.name, data.url, cb);
  }

  static delete(id, cb) {
    if (!id) {
      return cb(new Error('please provide an id'));
    }
    db.run('DELETE FROM servers WHERE id = ?', id, cb);
  }

  static clear(cb) {
    db.run('DELETE FROM servers', cb);
  }
}

module.exports = db;
module.exports.Server = Server;
