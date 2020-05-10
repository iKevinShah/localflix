#!/bin/sh

if [ -z "$1" ]
then
    echo "Videos directory not provided"
    exit 1
fi

if [ -d "$1" ] 
then
    echo "Directory $1 exists." 
else
    echo "Error: Directory $1 does not exists."
    exit 1
fi

echo "Creating JSON";

FILES_AND_FOLDERS=`find $1 ! -name . -type d -print -exec sh -c 'find "$1" -maxdepth 1 ! -type d' {} {} \; | sort`;

VIDEO_DIRECTORY="[";# Open JSON Array Braces
VIDEO_LIST="["; # Open JSON Array Braces


# Make for loop iterate over each line rather than over each space
export IFS=$'\n'
for i in $FILES_AND_FOLDERS
do
    if [ -d "${i}" ] ; then
    #echo "$i is a directory";
        if [ "$1" == "${i}" ]; then
            #echo "Skipping $i";
            sleep 1
        else
            VIDEO_DIRECTORY="$VIDEO_DIRECTORY \"$i\","
        fi
    
    else
        if [ -f "${i}" ]; then
            #echo "${i} is a file";
            VIDEO_LIST="$VIDEO_LIST \"$i\","
        else
            echo "${i} is not valid, exiting";
            exit 1
        fi
    fi
done

if [[ $VIDEO_DIRECTORY != "[" ]]; then 
    VIDEO_DIRECTORY=${VIDEO_DIRECTORY::-1}"]";
else        
    VIDEO_DIRECTORY="[]";
fi


if [[ $VIDEO_LIST != "[" ]]; then 
    VIDEO_LIST=${VIDEO_LIST::-1}"]";
else        
    VIDEO_LIST="[]";
fi

OUTPUT_IN_JSON="{\"directories\":"${VIDEO_DIRECTORY}",\"videos\":"${VIDEO_LIST}"}";
echo "---";
echo "Updated Content: ";
echo $OUTPUT_IN_JSON;
echo $OUTPUT_IN_JSON > /data/public/data.json
echo "Updated";
