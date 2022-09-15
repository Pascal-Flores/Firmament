#!/bin/bash
wmctrlresult=$(wmctrl -l -p -G)
wmctrlresult=$(grep $wmctrlresult "0x........")

windowids=()
for window in $wmctrlresult 
    do windowids+=( "$window" )
done 

for id in ${windowids[*]}
    do echo $id
done

exit 0