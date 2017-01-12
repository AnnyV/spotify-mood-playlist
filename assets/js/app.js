
"use strict";

var maxPlaylists = 1000;
var maxPlaylistsToDisplay = 1000;
var credentials = null;
var totalTracks = 0;
var totalPlaylistCount = 0;
var abortFetching = false;
var popNormalize = false;
var allPlaylists = [];
var topTracks = null;
var allTracks = {};
var playlistId = '3rgsDhGHZxZ9sB9DQWQfuf';

var url = 'https://embed.spotify.com/?uri='

// console.log(url);

function info(s) {
    $("#info").text(s);
}

function callSpotify(url, data) {
    return $.ajax(url, {
        dataType: 'json',
        data: data,
        headers: {
            'Authorization': 'Bearer ' + credentials.token
        }
    });
}

/* Call the Web API category list endpoint */
function getCategoryList() {

    var url = 'https://api.spotify.com/v1/browse/categories?limit=50'; 

    return $.ajax({
        url: url,
        headers: {
           'Authorization': 'Bearer ' +  credentials.token
        }
    });
}

/* Call the Web API category list endpoint */
function displayPlaylist() {

    var url = 'https://api.spotify.com/v1/users/spotify/playlists/';

    var playlistId =  ($(this).data("playlistid"));
console.log(($(this).data("playlistid")));

    url = url + playlistId 

    return $.ajax({
        url: url,
        headers: {
           'Authorization': 'Bearer ' +  credentials.token
        }

    });
}

function getCategoryPlaylists() {

    var url = 'https://api.spotify.com/v1/browse/categories/mood/playlists?offset=0&limit=50'; 

    return $.ajax({
        url: url,
        headers: {
           'Authorization': 'Bearer ' +  credentials.token
        }
    });
}

function go() {
/* Call the Web API category list endpoint */
    // getCategoryList()

    $("#login").hide();
    $("#get-playlists").hide();
    $("#playlists").show();

    getCategoryPlaylists()
         .then(function(response) {
                console.log(response)
                $("#playlists-well").empty()
                for (var i = 0; i < response.playlists.items.length; i++) {
                     var playlistId = response.playlists.items[i].id
                     var $p = $("<p>").addClass("playlist");
                     $p.text(response.playlists.items[i].name).attr("data-uri", response.playlists.items[i].uri);
                        
   
                    $("#playlists-well").append($p);
                }
            });

}





function initApp() {

    $("#login").show();
    $("#get-playlists").hide();
    $("#playlists").hide();

    $("#go").on('click', function() {
        go();
    });

    $("#login-button").on('click', function() {
        loginWithSpotify();
        });

    $(document).on('click', ".playlist", function() {
        displayPlaylist();
    });
}


    function loginWithSpotify() {
    var client_id = '0b30ba6a3ced43f5bc06c0902f79e47c';
    var redirect_uri = 'https://spotify-mood-playlist.herokuapp.com/';
    // var scopes = 'playlist-modify-public';
    if (document.location.hostname == 'localhost') {
        redirect_uri = 'http://localhost:8000/index.html';
    }
    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        // '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    document.location = url;
}


function getTime() {
    return Math.round(new Date().getTime() / 1000);
}



function performAuthDance() {
    // if we already have a token and it hasn't expired, use it,
    if ('credentials' in localStorage) {
        credentials = JSON.parse(localStorage.credentials);
    }

    if (credentials && credentials.expires > getTime()) {
        $("#login").hide();
        $("#get-playlists").show();
        $("#playlists").hide();
    } else {
    // we have a token as a hash parameter in the url
    // so parse hash
        var hash = location.hash.replace(/#/g, '');
        var all = hash.split('&');
        var args = {};
        all.forEach(function(keyvalue) {
            var idx = keyvalue.indexOf('=');
            var key = keyvalue.substring(0, idx);
            var val = keyvalue.substring(idx + 1);
            args[key] = val;
        });
        if (typeof(args['access_token']) != 'undefined') {
            var g_access_token = args['access_token'];
            var expiresAt = getTime() + 3600;
            if (typeof(args['expires_in']) != 'undefined') {
                var expires = parseInt(args['expires_in']);
                expiresAt = expires + getTime();
            }
            credentials = {
                token:g_access_token,
                expires:expiresAt
            }
            callSpotify('https://api.spotify.com/v1/me').then(
                function(user) {
                    credentials.user_id = user.id;
                    localStorage['credentials'] = JSON.stringify(credentials);
                    location.hash = '';
                    $("#search-form").show();
                },
                function() {
                    error("Can't get user info");
                }
            );
        } else {
    // otherwise, got to spotify to get auth
            $("#login").show();
        }
    }
}



$(document).ready(
    function() {
        initApp();
        performAuthDance();
        });

    $(document).on("click", ".playlist", function() {

        var uriPlaylist = $(this).data('uri');

        $(".myFrame").empty();

        $('<iframe>', {
           src: url + uriPlaylist,
           frameborder: 0,
           width: 300,
           height: 380,
           allowtransparency: true
           }).appendTo('.myFrame');
        function error(s) {
            info(s);
        }

    });