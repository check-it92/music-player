const figure = document.querySelector("figure");
const loading = document.querySelector(".loading");

const frame = document.querySelector("section");
const lists = frame.querySelectorAll("article");
const audios = frame.querySelectorAll("audio");
const prev = document.querySelector(".btnPrev");
const next = document.querySelector(".btnNext");

// activeAudio 변수 위치 이동
let activeAudio = null;

// 공통으로 사용할 handleAudioEnd 함수 정의
function handleAudioEnd() {
  if (!activeAudio) return;

  const currentArticle = activeAudio.closest("article");
  const activePic = currentArticle.querySelector(".pic");
  activePic.classList.remove("on");

  const articles = [...document.querySelectorAll("article")];
  let currentIndex = articles.findIndex((el) => el.classList.contains("on"));
  let nextIndex = (currentIndex + 1) % articles.length; // 마지막에서 처음으로

  const nextArticle = articles[nextIndex];
  const nextAudio = nextArticle.querySelector("audio");
  const nextPic = nextArticle.querySelector(".pic");
  const nextPlayIcon = nextArticle.querySelector(".play i");

  // 현재 article에서 on 클래스 제거
  currentArticle.classList.remove("on");

  // 다음 article에 on 클래스 추가
  nextArticle.classList.add("on");

  // 재생 버튼 아이콘 상태 업데이트
  const currentPlayIcon = currentArticle.querySelector(".play i");
  if (currentPlayIcon) {
    currentPlayIcon.classList.remove("fa-circle-pause");
    currentPlayIcon.classList.add("fa-circle-play");
  }

  if (nextPlayIcon) {
    nextPlayIcon.classList.remove("fa-circle-play");
    nextPlayIcon.classList.add("fa-circle-pause");
  }

  // 다음 오디오 재생
  activeAudio = nextAudio;
  nextAudio.play();
  nextPic.classList.add("on");

  // 프로그레스바 업데이트
  updateProgressBar(nextAudio, nextArticle.querySelector(".progress-bar"));
}

// article 로테이션 설정
const deg = 45;
let i = 0;
lists.forEach((list) => {
  const pic = list.querySelector(".pic");
  const play = list.querySelector(".play");
  const load = list.querySelector(".load");
  const progressContainer = list.querySelector(".progress-container");
  const progressBar = list.querySelector(".progress-bar");
  const circle = progressBar ? progressBar.querySelector(".circle") : null;

  list.style.transform = `rotate(${i * deg}deg) translateY(-100vh)`;
  pic.style.backgroundImage = `url("./img/song${i + 1}.jpg")`;
  pic.style.backgroundPosition = "50% 5%";
  pic.style.backgroundSize = "cover";
  i++;

  if (play) {
    // Play 버튼 이벤트를 토글 기능으로 수정
    play.addEventListener("click", (e) => {
      const article = e.currentTarget.closest("article");
      const activePic = article.querySelector(".pic");
      activeAudio = article.querySelector("audio");
      const playIcon = e.currentTarget.querySelector("i"); // 아이콘 요소 선택

      const isActive = article.classList.contains("on");

      if (!isActive) {
        lists.forEach((item) => {
          item.classList.remove("on");
          // 다른 모든 재생 아이콘 초기화
          const otherPlayIcon = item.querySelector(".play i");
          if (otherPlayIcon) {
            otherPlayIcon.classList.remove("fa-circle-pause");
            otherPlayIcon.classList.add("fa-circle-play");
          }
        });
        article.classList.add("on");
      }

      // 재생 상태에 따라 토글
      if (activeAudio.paused) {
        // 재생 시작
        activeAudio.play();
        activePic.classList.add("on");

        // 아이콘 변경 (재생 → 일시정지)
        playIcon.classList.remove("fa-circle-play");
        playIcon.classList.add("fa-circle-pause");
      } else {
        // 일시정지
        activeAudio.pause();
        activePic.classList.remove("on");

        // 아이콘 변경 (일시정지 → 재생)
        playIcon.classList.remove("fa-circle-pause");
        playIcon.classList.add("fa-circle-play");
      }

      updateProgressBar(activeAudio, progressBar);

      // 이전 ended 이벤트 리스너 제거 후 새로 추가
      activeAudio.removeEventListener("ended", handleAudioEnd);
      activeAudio.addEventListener("ended", handleAudioEnd);
    });
  }

  let lastClickTime = 0;
  let clickTimeout = null;
  const doubleClickDelay = 300;

  if (load) {
    // Load 버튼 이벤트 - 기존 기능 유지 + 더블클릭 시 한 곡 반복 기능 추가
    load.addEventListener("click", (e) => {
      const article = e.currentTarget.closest("article");
      const activePic = article.querySelector(".pic");
      activeAudio = article.querySelector("audio");
      const loadIcon = article.querySelector(".load i");
      const playIcon = article.querySelector(".play i");

      const isActive = article.classList.contains("on");

      if (isActive) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        // 첫 번째 클릭이거나 더블클릭이 아닌 경우 (일반 클릭)
        if (timeDiff > doubleClickDelay) {
          // 타임아웃 설정 (더블클릭을 기다림)
          clearTimeout(clickTimeout);

          clickTimeout = setTimeout(() => {
            // 더블클릭이 아니면 기존 기능 실행 (음악 처음부터 재생)
            activePic.classList.remove("on");
            activeAudio.load();

            activeAudio.addEventListener("loadeddata", () => {
              activeAudio.play();
              activePic.classList.add("on");

              // 아이콘 변경 (재생 → 일시정지)
              if (playIcon) {
                playIcon.classList.remove("fa-circle-play");
                playIcon.classList.add("fa-circle-pause");
              }

              updateProgressBar(
                activeAudio,
                article.querySelector(".progress-bar")
              );
            });

            // 반복 모드였다면 해제 (아이콘 원래대로)
            if (activeAudio.loop) {
              activeAudio.loop = false;
              loadIcon.classList.remove("active-repeat");
            }
          }, doubleClickDelay);
        }
        // 더블클릭인 경우
        else {
          clearTimeout(clickTimeout); // 일반 클릭 타임아웃 취소

          // 반복 모드 토글
          activeAudio.loop = !activeAudio.loop;

          // 아이콘 변경으로 상태 표시
          if (activeAudio.loop) {
            loadIcon.classList.add("active-repeat");
            console.log("반복 모드 켜짐");

            // 반복 모드일 때는 ended 이벤트 리스너 제거 (자동으로 다음 곡으로 넘어가지 않도록)
            activeAudio.removeEventListener("ended", handleAudioEnd);
          } else {
            loadIcon.classList.remove("active-repeat");
            console.log("반복 모드 꺼짐");

            // 반복 모드가 꺼지면 ended 이벤트 리스너 다시 추가
            activeAudio.addEventListener("ended", handleAudioEnd);
          }
        }

        lastClickTime = currentTime;
      }
    });
  }

  if (progressContainer) {
    // Progress-bar 클릭 이동
    progressContainer.addEventListener("click", (e) => {
      const article = e.currentTarget.closest("article");
      activeAudio = article.querySelector("audio");
      const activePic = article.querySelector(".pic");
      const playIcon = article.querySelector(".play i");

      // 위치 정보
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const containerWidth = rect.width;

      const duration = activeAudio.duration;
      if (!duration) return;

      // 비율계산
      const ratio = Math.max(0, Math.min(1, clickX / containerWidth));

      // 오디오 시간 및 프로그레스 바 업데이트
      activeAudio.currentTime = ratio * duration;
      progressBar.style.width = `${ratio * 100}%`;

      // 시간 표시 업데이트
      updateTimeDisplay(article, activeAudio);

      // 일시정지 상태였다면 재생 시작
      if (activeAudio.paused) {
        activeAudio.play();
        activePic.classList.add("on");

        // 아이콘 변경 (재생 → 일시정지)
        if (playIcon) {
          playIcon.classList.remove("fa-circle-play");
          playIcon.classList.add("fa-circle-pause");
        }
      }
    });
  }

  // 시간 표시 업데이트 함수
  function updateTimeDisplay(article, audio) {
    const currentTime = article.querySelector(".current");
    const duration = article.querySelector(".duration");

    if (currentTime && duration) {
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
    }
  }

  // 시간 포맷 함수
  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  }

  // Progress-bar 업데이트 함수
  function updateProgressBar(audio, progressBar) {
    if (!progressBar) return;
    const circle = progressBar.querySelector(".circle");
    const article = progressBar.closest("article");

    function step() {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;

        // 프로그레스 바 업데이트
        progressBar.style.width = `${progress}%`;

        // 시간 업데이트
        updateTimeDisplay(article, audio);
      }

      // 재생중일때만 업데이트
      if (!audio.paused) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => requestAnimationFrame(step), 50);
      }
    }

    // 최초 실행
    requestAnimationFrame(step);

    // 재생 시작 시 업데이트 재개
    audio.addEventListener("play", () => {
      requestAnimationFrame(step);
    });
  }
});

// 버튼 이벤트 최적화
let num = 0;
let active = 0;
const length = lists.length - 1;

const activation = (index, items) => {
  items.forEach((item) => item.classList.remove("on"));
  items[index].classList.add("on");
};

// 음악 정지 및 초기화 함수 추가
const initMusic = () => {
  audios.forEach((audio) => {
    audio.pause();
    audio.load();
    audio.parentElement.previousElementSibling.classList.remove("on");
  });

  // 재생 아이콘 초기화
  document.querySelectorAll(".play i").forEach((icon) => {
    icon.classList.remove("fa-circle-pause");
    icon.classList.add("fa-circle-play");
  });
};

// Prev 버튼 이벤트
prev.addEventListener("click", () => {
  initMusic();
  num++;
  frame.style.transform = `rotate(${num * deg}deg)`;
  active === 0 ? (active = length) : active--;
  activation(active, lists);

  // 이전 곡으로 이동 후 자동 재생
  const currentArticle = lists[active];
  const audio = currentArticle.querySelector("audio");
  const pic = currentArticle.querySelector(".pic");
  const playIcon = currentArticle.querySelector(".play i");

  activeAudio = audio;
  audio.play();
  pic.classList.add("on");

  // 아이콘 변경 (재생 → 일시정지)
  if (playIcon) {
    playIcon.classList.remove("fa-circle-play");
    playIcon.classList.add("fa-circle-pause");
  }

  updateProgressBar(audio, currentArticle.querySelector(".progress-bar"));
});

// Next 버튼 이벤트
next.addEventListener("click", () => {
  initMusic();
  num--;
  frame.style.transform = `rotate(${num * deg}deg)`;
  active === length ? (active = 0) : active++;
  activation(active, lists);

  // 다음 곡으로 이동 후 자동 재생
  const currentArticle = lists[active];
  const audio = currentArticle.querySelector("audio");
  const pic = currentArticle.querySelector(".pic");
  const playIcon = currentArticle.querySelector(".play i");

  activeAudio = audio;
  audio.play();
  pic.classList.add("on");

  // 아이콘 변경 (재생 → 일시정지)
  if (playIcon) {
    playIcon.classList.remove("fa-circle-play");
    playIcon.classList.add("fa-circle-pause");
  }

  updateProgressBar(audio, currentArticle.querySelector(".progress-bar"));
});

// 키보드 이벤트 - 스페이스바로 재생/일시정지 전환
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // 스크롤 방지

    const activeArticle = document.querySelector("article.on");
    if (!activeArticle) return;

    const audio = activeArticle.querySelector("audio");
    const pic = activeArticle.querySelector(".pic");
    const playIcon = activeArticle.querySelector(".play i");

    if (audio.paused) {
      audio.play();
      pic.classList.add("on");

      // 아이콘 변경 (재생 → 일시정지)
      if (playIcon) {
        playIcon.classList.remove("fa-circle-play");
        playIcon.classList.add("fa-circle-pause");
      }
    } else {
      audio.pause();
      pic.classList.remove("on");

      // 아이콘 변경 (일시정지 → 재생)
      if (playIcon) {
        playIcon.classList.remove("fa-circle-pause");
        playIcon.classList.add("fa-circle-play");
      }
    }
  }
});

// CSS 스타일 추가
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .active-repeat {
    color: #ff0;
  }
`;
document.head.appendChild(styleSheet);
