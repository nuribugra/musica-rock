const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const shuffleButton = document.getElementById("shuffle");

const allSongs = [
    {
        id: 0,
        title: "Fear Of The Dark",
        artist: "Iron Maiden",
        duration: "07:18",
        src: "src/music/Fear of the Dark (2015 Remaster).mp3",
        banner: "src/images/fotw.jpg"
    },
    {
        id: 1,
        title: "Here Comes The Rain Again",
        artist: "Eurythmics",
        duration: "04:41",
        src: "src/music/Here Comes The Rain Again.mp3",
        banner: "src/images/hctra.jpg"
    },
    {
        id: 2,
        title: "Sonne",
        artist: "Rammstein",
        duration: "04:12",
        src: "src/music/Rammstein - Sonne (Official Video).mp3",
        banner: "src/images/sonne.jpeg"
    },
    {
        id: 3,
        title: "The Unforgiven",
        artist: "Metallica",
        duration: "06:27",
        src: "src/music/The Unforgiven (Remastered).mp3",
        banner: "src/images/unforgiven.jpg"
    },
    {
        id: 4,
        title: "This I Love",
        artist: "Guns N' Roses",
        duration: "05:34",
        src: "src/music/This I Love.mp3",
        banner: "src/images/til.jpg"
    }
];

const audio = new Audio();

let userData = {
    songs: [...allSongs],
    currentSong: null,
    songCurrentTime: 0,
};

function playSong (id) {
    const song = userData.songs.find((song) => song.id === id);
    if (!song) return;

    if (userData.currentSong && userData.currentSong.id === song.id) {
        if (audio.paused) {
            audio.play();
            playButton.classList.add("playing");
            playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            pauseSong();
        }
        userData.songCurrentTime = audio.currentTime;
        return;
    }

    audio.src = song.src;
    audio.title = song.title;
    audio.currentTime = 0;
    audio.play();

    playButton.classList.add("playing");
    playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';

    userData.currentSong = song;
    userData.songCurrentTime = 0;

    updateBanner();
    setPlayerDisplay();
    highlightCurrentSong();
} 

function pauseSong() {
    audio.pause();
    playButton.classList.remove("playing");
    playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function updateBanner() {
    const bannerImage = document.getElementById("banner-image");

    if (bannerImage && userData.currentSong) {
        bannerImage.style.transition = "opacity 0.5s ease";
        bannerImage.style.opacity = 0;

        setTimeout(() => {
            bannerImage.src = userData.currentSong.banner;
            bannerImage.style.opacity = 1;
        }, 500);
    }
}

function playNextSong() {
    if (!userData.currentSong) {
        playSong(userData.songs[0].id);
        return;
    }
    
    const currentIndex = userData.songs.findIndex(song => song.id === userData.currentSong.id);
    if (currentIndex === -1) {
        playSong(userData.songs[0].id);
        return;
    }
    
    const nextIndex = (currentIndex + 1) % userData.songs.length;
    const nextSong = userData.songs[nextIndex];
    
    if (nextSong) {
        playSong(nextSong.id);
    }
}

function playPreviousSong() {
    if (!userData.currentSong) {
        playSong(userData.songs[0].id);
        return;
    }
    const currentSongIndex = getCurrentSongIndex();
    if (currentSongIndex === -1) return;
    const previousIndex = (currentSongIndex - 1 + userData.songs.length) % userData.songs.length;
    playSong(userData.songs[previousIndex].id);
}

function shuffle() {
    pauseSong();

    userData.songs = userData.songs.sort(() => Math.random() - 0.5); // Fisher-Yates shuffle algorithm

    userData.currentSong = null;
    userData.songCurrentTime = 0;

    renderSongs(userData?.songs);

    if (userData.songs.length > 0) {
        playSong(userData.songs[0].id); // İlk şarkıyı çal
    }
}

function deleteSong(id) {
    if (userData?.currentSong?.id === id) {
        userData.currentSong = null;
        userData.songCurrentTime = 0;

        pauseSong();
        setPlayerDisplay();
    }

    userData.songs = userData?.songs.filter((song) => song.id !== id);
    renderSongs(userData?.songs);
    highlightCurrentSong();
    setPlayButtonAccessibleText();

    let resetButton = document.getElementById("reset");

    if (userData?.songs.length === 0) {
        if (!resetButton) {
            resetButton = document.createElement("button");
            resetButton.id = "reset";
            resetButton.ariaLabel = "Reset playlist";
            resetButton.textContent = "Reset Playlist";
            playlistSongs.appendChild(resetButton);

            resetButton.addEventListener("click", () => {
                userData.songs = [...allSongs];
                renderSongs(sortSongs());
                setPlayButtonAccessibleText();
                resetButton.remove();
            });
        }
        resetButton.style.display = "block"; 
    } else if (resetButton) {
        resetButton.remove();
    }
}

function setPlayerDisplay() {
    const playingSong = document.getElementById("player-song-title");
    const songArtist = document.getElementById("player-song-artist");
    const songInfoContainer = document.querySelector(".song-information");

    const currentTitle = userData?.currentSong?.title;
    const currentArtist = userData?.currentSong?.artist;

    if (currentTitle && currentArtist) {
        playingSong.textContent = currentTitle;
        songArtist.textContent = currentArtist;
        songInfoContainer.style.visibility = "visible";
    } else {
        playingSong.textContent = "";
        songArtist.textContent = "";
        songInfoContainer.style.visibility = "hidden";
    }
}

function highlightCurrentSong() {
    const playlistSongElements = document.querySelectorAll(".playlist-song");
    const songToHighlight = document.getElementById(
        `song-${userData?.currentSong?.id}`
    );

    playlistSongElements.forEach((songEl) => {
        songEl.removeAttribute("aria-current");
    });

    if (songToHighlight) {
        songToHighlight.setAttribute("aria-current", "true");
    }
}

function renderSongs (array) {
    const songsHTML = array.map((song) => {
        return `
            <li id="song-${song.id}" class="playlist-song">
                <button class="song-info" onclick="playSong(${song.id})">
                    <h3 class="song-title">${song.title}</h3>
                    <p class="artist">${song.artist}</p>
                    <p class="duration">${song.duration}</p>
                </button>

                <button onclick="deleteSong(${song.id})" class="delete-button">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </li>
        `;
    }).join("");

    playlistSongs.innerHTML = songsHTML;
}

function setPlayButtonAccessibleText() {
    const song = userData?.currentSong || userData?.songs[0];

    playButton.setAttribute(
        "aria-label",
        song?.title ? `Play ${song.title}` : "Play"
    );
}

const getCurrentSongIndex = () => userData?.songs.findIndex((song) => song.id === userData?.currentSong?.id);


const sortSongs = () => {
    userData?.songs.sort((a,b) => {
      if (a.title < b.title) {
        return -1;
      }
  
      if (a.title > b.title) {
        return 1;
      }
  
      return 0;
    });
  
    return userData?.songs;
};
  
renderSongs(sortSongs());

playButton.addEventListener("click", () => {
    if (userData.currentSong === null) {
        playSong(userData.songs[0].id);
    } else {
        playSong(userData.currentSong.id);
    }
});

nextButton.addEventListener("click", playNextSong);
previousButton.addEventListener("click", playPreviousSong);
shuffleButton.addEventListener("click", shuffle);

audio.addEventListener("ended", playNextSong);

/* Progress bar */

const progressBar = document.getElementById('progress-bar');

let isDragging = false;

function updateTime(event) {
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = progressBar.clientWidth;
    const newTime = (x / width) * audio.duration;
    audio.currentTime = newTime;
    updateProgressBar();
}

function updateProgressBar() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.setProperty('--progress', `${progress}%`);
    }
}

progressBar.addEventListener('click', (event) => {
    updateTime(event);
});

progressBar.addEventListener('mousedown', (event) => {
    isDragging = true;
    updateTime(event);
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        updateTime(event);
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
    }
});

audio.addEventListener('timeupdate', updateProgressBar);

audio.addEventListener('play', () => {
    progressBar.style.setProperty('--progress', '0%');
});

// Volume Controls
const volumeIcon = document.querySelector(".volume-icon");
const volumeRange = document.querySelector(".volume-range");
let isMuted = false;

// Update the settings
function updateVolume(value) {
    audio.volume = value / 100;
    volumeRange.value = value;
}

// Mute function
function toggleMute() {
    if (isMuted) {
        audio.volume = 0.5; // veya istediğin bir default değer
        volumeRange.value = 50; // mute durumunda geri getirilen ses seviyesi
        volumeIcon.innerHTML = '<i class="fa-solid fa-volume-high"></i>'; // Ses ikonunu normale döndür
    } else {
        audio.volume = 0;
        volumeRange.value = 0; // mute durumunda ses seviyesini sıfırla
        volumeIcon.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'; // Mute ikonunu göster
    }
    isMuted = !isMuted;
}

// Volume Slider Event
volumeRange.addEventListener("input", (event) => {
    const value = event.target.value;
    updateVolume(value);
    isMuted = value === "0";
    volumeIcon.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
});

// Volume Icon Click Event
volumeIcon.addEventListener("click", () => {
    if (isMuted) {
        // Exit from the mute condition
        audio.volume = 0.5;
        volumeRange.value = 50;
        volumeIcon.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    } else {
        // Mute
        audio.volume = 0;
        volumeRange.value = 0;
        volumeIcon.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }
    isMuted = !isMuted;
});

// Initial volume setting
updateVolume(volumeRange.value);