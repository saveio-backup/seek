import levelup from 'levelup';
import leveldown from 'leveldown';

let db = levelup(leveldown('./myleveldb'));
db.put('name', 'ridesky', function (err) {
  if (err) return console.log('Ooops!', err);
  db.get('name', function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found

    // Ta da!
    console.log('name=' + value)
  })
})