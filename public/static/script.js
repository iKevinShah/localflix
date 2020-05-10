function App(instance_name, json_file, base_dir, relative_path) {

    //Site name
    this.name = instance_name;

    //The JSON file which has all the data
    this.json_file = json_file;

    //The path on FS
    this.base_dir = base_dir;

    //The path relative to "/"
    this.relative_path = relative_path;

    //The JSON file data.
    this.data = false;

    //The HTML5 Player
    this.player = false;
};

App.prototype.setPageTitle = function (title) {
    $("#page-title").html('<h3 class="text-center">' + title + '</h3>');
    document.title = title;
    return true;
};

App.prototype.initialize = function () {
    if(this.getJSON())
    {
        this.showDirectoriesListing();
        return true;
    }
    this.showError();
};

App.prototype.getJSON = function () {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", this.json_file, false); //false for synchronous request
    xmlHttp.send(null);
    if (xmlHttp.responseText) {
        try {
            this.data = JSON.parse(xmlHttp.responseText);
        }
        catch (error) {
            this.showError('invalid_json_file');
            throw 'JSON Data file invalid';
        }
    }

    if (!this.data || !this.data.directories || !this.data.videos) {
        console.log('Structure problematic');
        console.log("Type of Data returned: " + typeof this.data);
        console.log("Data: " + this.data);
        this.showError('invalid_json_file');
        return false;
    }
    console.log(this.data.directories.length);
    if (this.data.directories.length == 0) {
        console.log("No directories?");
        this.showError('no_directories');
        return false;
    }
    return true;
};

App.prototype.getDirectories = function () {
    this.setPageTitle(this.name);
    var directory_listing_html = '';
    for (var i in this.data.directories) {
        directory_listing_html += '<a href="javascript:void(0)" class="directory" data-listing="' + this.data.directories[i] + '">' + this.data.directories[i].replace(this.base_dir, '') + '</a>';
    }
    return directory_listing_html;
};

App.prototype.showDirectoriesListing = function (showAnimations) {

    this.destroyPlayer();

    this.setPageTitle(this.name);
    this.removeBackButton();

    var directories_html = this.getDirectories();

    if (showAnimations) {
        $('#directories-list').addClass('slideInLeft');
        $('#videos-list').addClass('slideOutRight');

        setTimeout(function () {
            $('#videos-list').html('');
            $('#video-player').html('');
            $('#error').html('');
            $('#directories-list').html(directories_html);
            setTimeout(function () {
                $('#directories-list').removeClass();
                $('#videos-list').removeClass();
                $('#video-player').removeClass();
            }, 200);
        }, 200);
    }
    else {
        $('#videos-list').html('');
        $('#video-player').html('');
        $('#error').html('');
        $('#directories-list').html(directories_html);
    }
};

App.prototype.getVideosOfDirectory = function (directory_name) {

    this.setPageTitle(directory_name.replace(this.base_dir, ''));
    this.showBackButton('goBack');
    console.log(directory_name);
    var videos_list_html = '';
    for (var i in this.data.videos) {
        if (this.data.videos[i].startsWith(directory_name)) {
            var video_extension = this.data.videos[i].split('.').pop();
            var video_name = (this.data.videos[i].replace(directory_name + '/', '')).split('.').slice(0, -1).join('.');
            if (video_extension === "mp4" || video_extension === "webm" || video_extension === "ogg") {
                videos_list_html += '<a href="javascript:void(0)" class="video" data-video="' + this.data.videos[i] + '">' + video_name + '</a>';
            }
            if (video_extension === "mpg" || video_extension === "avi" || video_extension === "mpeg" || video_extension === "wmv") {
                videos_list_html += '<a href="javascript:void(0)">Unsupported Filetype <code>' + video_extension + '</code>: ' + video_name + '.' + video_extension + '</a>';
            }
        }
    }
    if (videos_list_html === '') {
        return false;
    }
    return videos_list_html;
};

App.prototype.showVideosOfDirectory = function (directory_name) {

    if (!directory_name) {
        this.showError('no_directory_name');
    }

    this.destroyPlayer();

    var videos_list_html = this.getVideosOfDirectory(directory_name);

    if (!videos_list_html) {
        this.showError('no_videos');
        return;
    }

    $('#directories-list').addClass('slideOutLeft');
    $('#videos-list').addClass('slideInRight');

    setTimeout(function () {
        $('#video-player').html('');
        $('#directories-list').html('');
        $('#error').html('');
        $('#videos-list').html(videos_list_html);
        setTimeout(function () {
            $('#directories-list').removeClass();
            $('#videos-list').removeClass();
            $('#video-player').removeClass();
        }, 200);
    }, 200);

};

App.prototype.destroyPlayer = function (error_type) {
    if (this.player) {
        this.player.pause();
        this.player.destroy();
    }
    this.player = false;
    return true;
};


App.prototype.getVideoPlayer = function (video_url) {

    var video_player = '';

    //Replace "path on filesystem" with "path relative to /"
    video_url = video_url.replace(this.base_dir, this.relative_path);

    video_player += '<video id="player">';

    var video_type = video_url.split('.').pop();

    if (video_type === "mp4") {
        video_player += '<source src="' + video_url + '" type="video/mp4" />';
    }

    if (video_type === "webm") {
        video_player += '<source src="' + video_url + '" type="video/webm" />';
    }

    if (video_type === "ogg") {
        video_player += '<source src="' + video_url + '" type="video/ogg" />';
    }

    video_player += '</video>';
    return video_player;
};

App.prototype.showVideo = function (video_url, video_title) {

    this.destroyPlayer();

    if (!video_url) {
        this.showError('no_video_url');
    }

    this.setPageTitle(video_title);

    if (video_title.length > 15) {
        video_title = video_title.substring(0, 12) + '...';
    }

    this.showBackButton('goBackToVideoList', video_url);
    var video_player_html = this.getVideoPlayer(video_url);

    $('#videos-list').addClass('slideOutLeft');
    $('#video-player').addClass('slideInRight');

    setTimeout(function () {
        $('#video-player').html(video_player_html);
        $('#videos-list').html('');
        $('#error').html('');
        $('#directories-list').html('');
        this.player = new Plyr('#player', {
            title: video_url,
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'captions', 'airplay', 'fullscreen'],
            settings: ['quality', 'speed', 'loop'],
            fullscreen: { enabled: true, fallback: false, iosNative: false, container: null },
            ratio: '16:9',
            autoplay: false
        });
        setTimeout(function () {
            $('#directories-list').removeClass();
            $('#videos-list').removeClass();
            $('#video-player').removeClass();
        }, 200);
    }, 200);
};

App.prototype.showBackButton = function (identifier, video_url) {
    if (!video_url) {
        $("#back").html('<a href="javascript:void(0)" id="' + identifier + '"><span>Back</span></a>');
        return true;
    }
    $("#back").html('<a href="javascript:void(0)" id="' + identifier + '" data-video="' + video_url + '"><span>Back</span></a>');
    return true;
};

App.prototype.removeBackButton = function () {
    $("#back").html('');
    return true;
};

App.prototype.goBackToDirectories = function (showAnimations) {
    this.destroyPlayer();
    this.showDirectoriesListing(showAnimations);
    return true;
};

App.prototype.goBackToVideosListing = function (video_currently_playing) {
    if (!video_currently_playing) {
        this.showError('video_not_found');
    }

    var directory_of_video = video_currently_playing.substring(0, video_currently_playing.lastIndexOf("/") + 1); //Get Directory name
    directory_of_video = directory_of_video.substring(0, directory_of_video.length - 1); //Remove trailing slash

    if (!directory_of_video) {
        this.showError('no_directory_name');
    }

    this.destroyPlayer();

    var videos_list_html = this.getVideosOfDirectory(directory_of_video);

    $('#videos-list').addClass('slideInLeft');
    $('#video-player').addClass('slideOutRight');

    setTimeout(function () {
        $('#video-player').html('');
        $('#directories-list').html('');
        $('#error').html('');
        $('#videos-list').html(videos_list_html);
        setTimeout(function () {
            $('#directories-list').removeClass();
            $('#videos-list').removeClass();
            $('#video-player').removeClass();
        }, 200);
    }, 200);
};

App.prototype.showError = function (error_type) {
    
    if(!error_type)
    {
        error_type = 'unexpected';        
    }
    var error_msg = "Some Unexpected Error occurred";

    if (error_type == "invalid_json_file") {
        error_msg = "JSON Data file not found or is not valid.";
    }
    if (error_type == "no_video_url") {
        this.showBackButton('goBackFromError');
        error_msg = "Video URL not found in the entry.";
    }
    if (error_type === "video_not_found") {
        this.showBackButton('goBackFromError');
        error_msg = "Unable to detect the directory of the video";
    }
    if (error_type == "no_directory_name") {
        this.showBackButton('goBackFromError');
        error_msg = "Directory name invalid or not found";
    }

    if (error_type == "no_directories") {
        error_msg = "No directories found in JSON Data file. Ensure that the videos are structured in directories";
    }

    if (error_type == "no_videos") {
        this.showBackButton('goBackFromError');
        error_msg = "No videos found in the selected Directory...";
    }

    if (error_type == "404") {
        this.showBackButton('goBackFromError');
        error_msg = "404 - Page Not found";
    }
    $('#video-player').html('');
    $('#videos-list').html('');
    $('#directories-list').html('');
    $('#error').html('<div id="error-msg">Error: ' + error_msg + '</div>');
    throw new Error(error_msg);
};
s
