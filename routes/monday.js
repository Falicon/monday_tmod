/* ****************************************
CHECK TMOD - check if we have a team member of the day record for today
**************************************** */
exports.check_tmod = function(req, res) {
  var account_id = req.param('account_id') || '';
  var session_token = req.param('session_token') || 'wrongSecret';

  // check if this is a valid session token
  try {
    var decode = req.jsonwebtoken.verify(session_token, 'YOUR_APP_SECRET', function(err, decoded) {
      if (err !=== undefined) {
        res.json({});
      } else {
        // check if we have a record for this account for today yet
        var tmod_record = req.monday_db.get_tmod(req.db, account_id);
        tmod_record.then(function(data) {
          if (data != undefined) {
            // return the team member of the day record
            res.json(data);

          } else {
            // no record found; return an empty object
            res.json({});

          }
        });
      }
    });

  } catch (err) {
    res.json({});

  }

};

/* ****************************************
MONDAY.COM WIDGET
**************************************** */
exports.monday = function(req, res) {
  // https://github.com/mondaycom/monday-sdk-js
  res.render('monday_team_member_of_the_day');

};

/* ****************************************
SAVE TMOD - save the team member of the day record for today
**************************************** */
exports.save_tmod = function(req, res) {
  var account_id = req.param('account_id') || '';
  var users = req.param('users') || [];
  var most_active_id = req.param('most_active') || '';
  var session_token = req.param('session_token') || 'wrongToken';

  try {
    var decode = req.jsonwebtoken.verify(session_token, 'YOUR_APP_SECRET', function(err, decoded) {
      if (err !=== undefined) {
        res.json({});
      } else {
        // check if we have a record for this account for today yet
        // get the details of the most active user
        let most_active = {};
        if (most_active_id > -1) {
          for (var i = 0; i < users.length; i++) {
            if (users[i]['id'] == most_active_id) {
              most_active = users[i];
            }
          }
        }

        // get a list of the recent team members of the day (latest 1000)
        var recent_tmod = req.monday_db.get_recent_tmod(req.db, account_id);
        recent_tmod.then(function(data) {
          let avail = [];
          if (data != undefined) {
            // remove any recent team member of the day winners from the current pool of users
            for (var i = 0; i < users.length; i++) {
              let user_found = false;
              for (var j = 0; j < data.length; j++) {
                if (users[i]['id'] == data[j]['id']) {
                  user_found = true;
                  break;

                }

              }
              if (!user_found) {
                avail.push(users[i]);

              }

            }

          }

          // randomly select a user to be today's team member of the day (ideally removing members who have already been featured recently)
          let rand_slot = -1;
          let tmod = {};
          if (avail.length > 0) {
            // pick from this list b/c they have not been picked before 
            rand_slot = Math.floor(Math.random() * avail.length);
            tmod = avail[rand_slot];

          } else {
            rand_slot = Math.floor(Math.random() * users.length);
            tmod = users[rand_slot];

          }

          // save the details (so future loads for today don't have to recalculate)
          let rec = {
            'account_id':account_id,
            'tmod':tmod,
            'most_active':most_active

          };

          req.monday_db.save_tmod(req.db, rec);

          res.json(rec);

        });

      }
    } else {
      res.json({});

    }
  } catch(err) {
    res.json({});

  }

};
