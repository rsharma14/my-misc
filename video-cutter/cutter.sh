#!/bin/bash
#echo '[["00:00:00","00:00:06"],["00:00:00","00:00:14"]]'
#echo 'C:\Users\ac49999\git\APPS\2.MPG\my-misc\video-cutter\a.mp4'
DT=$(date '+%Y%m%d%H%M%S')
echo "DT=$DT"
PAR_FOLDER="Downloads"
mkdir ~/$PAR_FOLDER/$DT

read -r -p "Enter clips times in the format [[1,2],[3,2]]: " array_str
array_str=[["00:00:00","00:00:10"],["00:00:35","00:00:48"],["00:00:52","00:01:00"]]
read -r -p "Enter video file location to be clipped: " ip_video
ip_video="C:\Users\ac49999\git\APPS\2.MPG\my-misc\video-cutter\a.mp4"
ip_video=$(echo $ip_video | sed 's|\\|/|g')

echo "ip_video="$ip_video
OUTPUT=$(basename "$ip_video")
echo "OUTPUT="$OUTPUT

trimmed_str="${array_str#\[}"
trimmed_str="${trimmed_str%\]}"
space_separated_str="${trimmed_str//,/ }"

IFS="][" read -r -a arrays <<<"${space_separated_str}"
idx=0
for element in "${arrays[@]}"; do
    IFS=" " read -r -a array <<<"${element}"

    if [[ -n "${array[0]}" && ${#array[@]} -eq 2 ]]; then
        START="${array[0]//\"/}" #remove "" as throwing error
        END="${array[1]//\"/}"

        echo "$START:$END:$idx"
        echo "ffmpeg -ss $START -to $END -i $ip_video -c copy  ~/$PAR_FOLDER/$DT/$idx$OUTPUT"
        ffmpeg -ss $START -to $END -i "$ip_video" -c copy ~/$PAR_FOLDER/$DT/$idx$OUTPUT
        ((idx++))
		echo ""
		echo "----------$idx clip completed----------"
		echo ""
    fi
done

echo "<===Total $idx clips are saved in ~/$PAR_FOLDER/$DT folder===>"
