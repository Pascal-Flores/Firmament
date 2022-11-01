const keyCodes : RegExp = /^([0-9A-Z)!@#$%^&*(:+<_>?~{|}";=,\-./`[\\\]']|F1*[1-9]|F10|F2[0-4]|Plus|Space|Tab|Capslock|Numlock|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen|num[0-9]|numdec|numadd|numsub|nummult|numdiv)$/;
const modifiers : RegExp = /^(Command|Cmd|Control|Ctrl|CommandOrControl|CmdOrCtrl|Alt|Option|AltGr|Shift|Super)$/

export function isAccelerator(maybeAccelerator : string) : boolean{
	if (maybeAccelerator.charAt(0) == '+' || maybeAccelerator.charAt(maybeAccelerator.length-1) == '+')
		return false;

	let splitAccelerator : string[] = maybeAccelerator.split('+');
	let result : boolean = true;
	if (!modifiers.test(splitAccelerator[0])){
		return false;
	}
	splitAccelerator.forEach(element => {
		 if (!(keyCodes.test(element) || modifiers.test(element)))
		 	result = false;
	})

	return result;
 }
