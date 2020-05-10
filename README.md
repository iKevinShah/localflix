# Simple Localflix

A self-hosted simplistic solution to stream your local videos. Should work well with any webserver. Tested with nginx (1.17).

## Why?

Got tired of sending and receiving recorded videos thought this is better instead. Also thought it'd be fun.

## Working
The solution expects a json file with the following structure:
````
{
    "directories" : ["/path/to/dir1", "/path/to/dir1", ... "/path/to/dirN"]
    "videos" " ["/path/to/dir1/video1.mp4", "/path/to/dir1/video2.mp4" ...."/path/to/dirN/videoZ.mp4"];
}
````

For easy creation of JSON File, I have also added a `filesystem_json_creator.sh` which will create the required json structure and create a json file in `/data/public/data.json` (Hard-coded location).

Usage of `filesystem_json_creator.sh` is `sh filesystem_json_creator.sh /path/to/directories' , where the /path/to/directories has all the folders and videos within them.

Supported structure is, a directory which contains a list of directories which all contain videos.

````
+-- directory_of_videos
|   +-- directory_1
    |   +-------video 1
    |   +-------video 2
    |   +-------video n
|   +-- directory_2
    |   +-------video 1
    |   +-------video 2
    |   +-------video n
...
|   +-- directory_n
    |   +-------video 1
    |   +-------video 2
    |   +-------video n
+-- index.html
+-- static
````

## Setting up

### Easy way (run via docker)

1. I have published an image for localflix. More details : https://github.com/iKevinShah/localflix-docker

### The older way

1. Upload this to / or any directory on your local webserver.
2. Make sure the video directory is available(accessible) on web server.
3. Create JSON file (manually OR via the filesystem_json_creator.sh) script.
4. Edit index.html app creation line.
   Usage: 
````
var app = new App(Site Name, JSONDataFileLocation, PathOfVideosDirectoryOnFileSystem, RelativePath);
````

5. Enjoy your local media.

## Screenshots: 

### Homepage
![Home page](https://www.ikevinshah.com/static/localflix/localflix-home.png)

### Video Listing
![Video Listing](https://www.ikevinshah.com/static/localflix/localflix-videolisting.png)

### Error in case of missing JSON
![If JSON file is not found](https://www.ikevinshah.com/static/localflix/localflix-error.png)

## Known issues / problems / shortcomings: 

1. This does not add History (and hence does not change URL)
2. All bugs of "plyr" stand true here.
3. Only supports mp4 | webm | ogg videos.


## Made with: 
1. Cash : https://github.com/fabiospampinato/cash
2. Plyr : https://github.com/sampotts/plyr
