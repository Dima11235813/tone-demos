(function () {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
    // https://tonejs.github.io/docs/13.8.25/UserMedia#close
    //https://github.com/Tonejs/Tone.js/blob/13.8.25/Tone/component/Channel.js#L46
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API

    const callBackack = (src) => {
        // debugger//blob created
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

//https://tonejs.github.io/examples/player.html
function playMusicReturnBlob(_cb) {
    let BlobToReturn
    console.clear();
    let micElement = document.querySelector("tone-microphone")
    let toneOscillElement = document.querySelector("tone-oscilloscope")
    const audio = document.querySelector('audio');

    // UPDATE: there is a problem in chrome with starting audio context
    //  before a user gesture. This fixes it.
    var started = false;
    document.documentElement.addEventListener('keyup', (event) => {
        if (started) return;
        if(event.code !== "Enter")return
        started = true;
        //you probably DONT want to connect the microphone
        //directly to the master output because of feedback.
        var mic = new Tone.UserMedia();

        //bind the interface
        // debugger
        micElement.bind(mic);
        toneOscillElement.bind(mic);

        // const synth = new Tone.Synth();
        let chunks = [];

        const actx = Tone.context;
        const dest = actx.createMediaStreamDestination();
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
        const recorder = new MediaRecorder(dest.stream);
        recorder.start()
        recorder.ondataavailable = evt => chunks.push(evt.data)
        mic.connect(dest)
        mic.open().then((event) => {
            console.log("Stream is open")          
        })
        document.documentElement.addEventListener('keyup', (event) => {
            if(event.code !== "Space")return
            recorder.stop()
        })
        recorder.onstop = function(e) {
            console.log("recorder stopped");
            let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
            let source = URL.createObjectURL(blob);
            audio.src = source
            console.log(source)
            mic.close()
            _cb(source)
        }
    });
}