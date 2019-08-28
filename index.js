(function () {
    //you probably DONT want to connect the microphone
    //directly to the master output because of feedback.
    var mic = new Tone.UserMedia();

    //bind the interface
    document.querySelector("tone-microphone").bind(mic);
    document.querySelector("tone-oscilloscope").bind(mic);

    const callBackack = (src) => {
        debugger//blob created
        //the player
        var player = new Tone.Player({
            "url": `${src}`,
            "loop": true,
            "loopStart": 0.5,
            "loopEnd": 0.7,
        }).toMaster();
    
        //bind the interface
        document.querySelector("tone-player").bind(player);
        document.querySelector("tone-play-toggle").bind(player);
    }
    playMusicReturnBlob(callBackack)

}())

function playMusicReturnBlob(_cb) {
    let BlobToReturn
    console.clear();

    // UPDATE: there is a problem in chrome with starting audio context
    //  before a user gesture. This fixes it.
    var started = false;
    document.documentElement.addEventListener('mousedown', () => {
        if (started) return;
        started = true;
        const audio = document.querySelector('audio');
        const synth = new Tone.Synth();
        const actx = Tone.context;
        const dest = actx.createMediaStreamDestination();
        const recorder = new MediaRecorder(dest.stream);

        synth.connect(dest);
        synth.toMaster();

        const chunks = [];

        const notes = 'CDEFGAB'.split('').map(n => `${n}4`);
        let note = 0;
        Tone.Transport.scheduleRepeat(time => {
            if (note === 0) recorder.start();
            if (note > notes.length) {
                synth.triggerRelease(time)
                recorder.stop();
                Tone.Transport.stop();
            } else synth.triggerAttack(notes[note], time);
            note++;
        }, '4n');

        recorder.ondataavailable = evt => chunks.push(evt.data);
        recorder.onstop = evt => {
            let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
            let source = URL.createObjectURL(blob);
            audio.src = source
            _cb(source)
        };

        Tone.Transport.start();
    });
}