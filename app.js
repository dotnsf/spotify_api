//. app.js

var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cookieParser = require( 'cookie-parser' ),
    cors = require( 'cors' ),
    ejs = require( 'ejs' ),
    fs = require( 'fs' ),
    queryString = require( 'querystring' ),
    request = require( 'request' ),
    session = require( 'express-session' ),
    app = express();

require( 'dotenv' ).config();

//. env values
var spotify_client_id = 'SPOTIFY_CLIENT_ID' in process.env ? process.env.SPOTIFY_CLIENT_ID : '';
var spotify_client_secret = 'SPOTIFY_CLIENT_SECRET' in process.env ? process.env.SPOTIFY_CLIENT_SECRET : '';
var spotify_redirect_uri = 'SPOTIFY_REDIRECT_URI' in process.env ? process.env.SPOTIFY_REDIRECT_URI : '';


app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( cors() );
app.use( cookieParser() );

app.use( express.static( __dirname + '/public' ) );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

//. Session
var sess = {
  secret: 'MySpotifySession',
  cookie: {
    path: '/',
    maxAge: (7 * 24 * 60 * 60 * 1000)    //. １週間
  },
  resave: false,
  saveUninitialized: true
};
app.use( session( sess ) );


//. GET Playlist
app.getPlaylist = function( access_token, id ){
  return new Promise( ( resolve, reject ) => {
    if( access_token ){
      if( id ){
        var options = {
          url: 'https://api.spotify.com/v1/playlists/' + id,
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };
        request.get( options, function( err, response, data ){
          if( err ){
            resolve( { status: false, error: err } );
          }else{
            //console.log( { data } );
            resolve( { status: true, data: data } );
          }
        });
      }else{
        var options = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };
        request.get( options, function( err, response, data ){
          if( err ){
            resolve( { status: false, error: err } );
          }else{
            console.log( JSON.stringify( data.items, null, 2 ) );
            resolve( { status: true, items: data.items } );
          }
        });
      }
    }else{
      resolve( { status: false, error: 'parameter both access_token and id needed.' } );
    }
  });
}

//. GET Episodes
app.getEpisodes = function( access_token, id ){
  return new Promise( ( resolve, reject ) => {
    if( access_token ){
      if( id ){
        var options = {
          url: 'https://api.spotify.com/v1/playlists/' + id,
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };
        request.get( options, function( err, response, data ){
          if( err ){
            resolve( { status: false, error: err } );
          }else{
            console.log( { data } );
            resolve( { status: true, data: data } );
          }
        });
      }else{
        var options = {
          //url: 'https://api-partner.spotify.com/v1/me/episodes',
          url: 'https://api.spotify.com/v1/me/episodes',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };
        request.get( options, function( err, response, data ){
          if( err ){
            resolve( { status: false, error: err } );
          }else{
            console.log( data.items );
            resolve( { status: true, items: data.items } );
          }
        });
      }
    }else{
      resolve( { status: false, error: 'parameter both access_token and id needed.' } );
    }
  });
}

//. GET Shows
app.getShows = function( access_token, id ){
  return new Promise( ( resolve, reject ) => {
    if( access_token ){
      if( id ){
        var options = {
          url: 'https://api.spotify.com/v1/shows/' + id,
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };
        request.get( options, function( err, response, data ){
          if( err ){
            resolve( { status: false, error: err } );
          }else{
            console.log( { data } );
            resolve( { status: true, data: data } );
          }
        });
      }else{
        var options = {
          url: 'https://api.spotify.com/v1/me/shows',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };
        request.get( options, function( err, response, data ){
          if( err ){
            resolve( { status: false, error: err } );
          }else{
            //console.log( data.items );
            resolve( { status: true, items: data.items } );
          }
        });
      }
    }else{
      resolve( { status: false, error: 'parameter both access_token and id needed.' } );
    }
  });
}




//. login
app.get( '/spotify/login', function( req, res ){
  var state = generateRandomString( 16 );
  res.cookie( stateKey, state );

  var scope = 'user-read-private user-read-email';
  res.redirect( 'https://accounts.spotify.com/authorize?' + 
    queryString.stringify({
      response_type: 'code',
      client_id: spotify_client_id,
      scope: scope,
      redirect_uri: spotify_redirect_uri,
      state: state
    })
  );
});

//. logout
app.get( '/spotify/logout', function( req, res ){
  //req.logout();
  req.session.spotify = {};
  res.redirect( '/' );
});

app.get( '/spotify/callback', function( req, res ){
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if( state == null || state != storedState ){
    res.redirect( '/#' +
      queryString.stringify( { error: 'state_mismatch' } )
    );
  }else{
    res.clearCookie( stateKey );
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: spotify_redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        Authorization: 'Basic ' + ( new Buffer( spotify_client_id + ':' + spotify_client_secret ).toString( 'base64' ) )
      },
      json: true
    };

    request.post( authOptions, function( err, response, body ){
      if( !err && response.statusCode == 200 ){
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true
        };

        req.session.spotify = {};
        req.session.spotify.access_token = access_token;
        req.session.spotify.refresh_token = refresh_token;

        request.get( options, function( err, response, user ){
          //. user = { country: 'JP', display_name: 'dotnsf', email: 'dotnsf@mail.com', explicit_content: { filter_enabled: false, filter_locked: false }, external_urls: { spotify: 'https://open.spotify.com/user/xxxxx' }, followers: { href: null, total: 0 }, href: 'https://api.spotify.com/v1/users/xxxxx', id: 'xxxxx', images: [], product: 'free', type: 'user', uri: 'spotify:user:xxxxx' }
          //console.log( user ); 
          req.session.spotify.user = user;

          res.redirect( '/' );
          /*
          res.redirect( '/#' + 
            queryString.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            })
          );
          */
        });
      }else{
        res.redirect( '/#' + 
          queryString.stringify({
            error: 'invalid_token'
          })
        );
      }
    })
  }
});

app.get( '/spotify/callback', function( req, res ){
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: 'Basic ' + ( new Buffer( spotify_client_id + ':' + spotify_client_secret ).toString( 'base64' ))},
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post( authOptions, function( err, response, body ){
    if( !err && response.statusCode == 200 ){
      var access_token = body.access_token;
      res.send({
        access_token: access_token
      });
    }
  });
});

app.get( '/', async function( req, res ){
  if( req.session && req.session.spotify && req.session.spotify.access_token ){
    var r1 = await app.getPlaylist( req.session.spotify.access_token );
    //var r2 = await app.getEpisodes( req.session.spotify.access_token );
    //var r3 = await app.getShows( req.session.spotify.access_token );
    res.render( 'index', { status: true, user: req.session.spotify.user, playlists: r1.items } );
  }else{
    res.render( 'index', { status: false, user: null, playlists: null } );
  }
});


//. 指定された長さのランダムな文字列を作成する
function generateRandomString( length ){
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for( var i = 0; i < length; i ++ ){
    text += possible.charAt( Math.floor( Math.random() * possible.length ) );
  }

  return text;
}

var stateKey = 'spotify_auth_state';


function timestamp2datetime( ts ){
  if( ts ){
    var dt = new Date( ts );
    var yyyy = dt.getFullYear();
    var mm = dt.getMonth() + 1;
    var dd = dt.getDate();
    var hh = dt.getHours();
    var nn = dt.getMinutes();
    var ss = dt.getSeconds();
    var datetime = yyyy + '-' + ( mm < 10 ? '0' : '' ) + mm + '-' + ( dd < 10 ? '0' : '' ) + dd
      + ' ' + ( hh < 10 ? '0' : '' ) + hh + ':' + ( nn < 10 ? '0' : '' ) + nn + ':' + ( ss < 10 ? '0' : '' ) + ss;
    return datetime;
  }else{
    return "";
  }
}

function sortByTimestamp( a, b ){
  var r = 0;
  if( a.timestamp < b.timestamp ){
    r = -1;
  }else if( a.timestamp > b.timestamp ){
    r = 1;
  }

  return r;
}


var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );
