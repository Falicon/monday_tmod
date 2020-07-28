/***************************************
GET RECENT Team Member of the Day
***************************************/
exports.get_recent_tmod = function(db, account_id) {
  var monday = db.get('monday');
  return monday.find({'account_id':account_id}, {'fields': {'id':1}, 'sort':{'date':-1}, 'limit':100});

}

/***************************************
GET Team Member of the Day
***************************************/
exports.get_tmod = function(db, account_id) {
  var monday = db.get('monday');

  // get today's date
  let date = new Date();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();
  let year = date.getFullYear();
  let date_string = [
    year,
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('');

  return monday.findOne({'account_id':account_id, 'date':date_string});

}

/***************************************
SAVE Team Member of the Day
***************************************/
exports.save_tmod = function(db, rec) {
  var monday = db.get('monday');

  // get today's date
  let date = new Date();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();
  let year = date.getFullYear();
  let date_string = [
    year,
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('');

  rec['date'] = date_string;

  return monday.insert(rec);

}
