class ScreenRecordingService {
  controller: MediaRecorder | undefined;
  chunks: Blob[] = [];
  dimensions = { width: 0, height: 0 };

  async start() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      // @ts-ignore
      selfBrowserSurface: "include",
    });

    const videoTrack = stream.getVideoTracks()[0];
    this.dimensions = {
      width: videoTrack.getSettings().width ?? 0,
      height: videoTrack.getSettings().height ?? 0,
    };
    this.controller = new MediaRecorder(stream);
    this.controller.ondataavailable = this.handleRecorderEvents;

    this.controller.start();
  }

  stop(
    setVideoSrc: (
      url: string,
      dimensions: { width: number; height: number },
    ) => void,
  ) {
    if (this.controller) {
      this.controller.onstop = () => {
        const recordedBlob = new Blob(this.chunks, { type: "video/webm" });

        // Create a temporary URL for the Blob
        const videoURL = URL.createObjectURL(recordedBlob);

        setVideoSrc(videoURL, this.dimensions);
      };
      this.controller.stop();
      this.controller.stream.getTracks().forEach((track) => track.stop());
    }
  }

  handleRecorderEvents = (event: BlobEvent) => {
    if (event.data.size > 0) {
      this.chunks.push(event.data);
    }
  };

  pauseAndResume = () => {
    if (this.isPaused()) {
      this.controller?.resume();
    } else {
      this.controller?.pause();
    }
  };

  isRecording = () => {
    return this.controller?.state === "recording";
  };

  isPaused = () => {
    return this.controller?.state === "paused";
  };
}

class PauseButton {
  isPaused = false;
  element: HTMLButtonElement;

  constructor(handleClick: () => void) {
    this.element = document.createElement("button");
    this.element.style.background =
      "linear-gradient(0deg, #13151A, #13151A), linear-gradient(0deg, #343841, #343841)";
    this.element.style.border = "none";
    this.element.style.padding = "8px";
    this.element.style.margin = "4px";
    this.setInnerHtml();
    this.element.addEventListener("click", () => {
      handleClick();
      this.handleClick();
    });
  }

  handleClick = () => {
    this.isPaused = !this.isPaused;
    this.setInnerHtml();
  };

  setInnerHtml() {
    this.element.innerHTML = this.isPaused
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="lightgray" width="20">
  <path d="M15 6.75a.75.75 0 0 0-.75.75V18a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75H15ZM20.25 6.75a.75.75 0 0 0-.75.75V18c0 .414.336.75.75.75H21a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75h-.75ZM5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L5.055 7.061Z" />
</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" fill="lightgray" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20">
  <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
`;
  }
}

class StopButton {
  element: HTMLButtonElement;

  constructor(handleClick: () => void) {
    this.element = document.createElement("button");
    this.element.style.background = `linear-gradient(0deg, #13151A, #13151A), linear-gradient(0deg, #343841, #343841)`;
    this.element.style.border = "none";
    this.element.style.padding = "8px";
    this.element.style.margin = "4px";
    this.setInnerHtml();
    this.element.addEventListener("click", handleClick);
  }

  private setInnerHtml() {
    this.element.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
  </svg>
  `;
  }
}

class RemoveButton {
  element: HTMLDivElement;

  constructor(handleClick: () => void) {
    this.element = document.createElement("div");
    this.element.style.padding = "8px";
    this.element.style.position = "absolute";
    this.element.style.right = "0";
    this.element.style.top = "0";

    this.element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20">
  <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" />
</svg>
`;
    this.element.addEventListener("click", handleClick);
  }
}

class Timer {
  element: HTMLDivElement;
  paused = false;
  private count: number;

  constructor() {
    this.count = 0;
    this.element = document.createElement("div");
    this.element.style.color = "#fff";
    this.element.style.gridColumn = "span 2";
    this.element.style.textAlign = "center";
    this.element.style.fontFamily = "sans-serif";
    this.element.style.fontSize = "10px";
    this.element.style.padding = "4px";
    this.element.innerText = "00:00";
    this.setInterval();
  }

  private setInterval() {
    setTimeout(() => {
      if (!this.paused) {
        this.count++;
        var minutes = Math.floor(this.count / 60);
        var remainingSeconds = this.count % 60;
        this.element.innerText =
          String(minutes).padStart(2, "0") +
          ":" +
          String(remainingSeconds).padStart(2, "0");
      }
      this.setInterval();
    }, 1000);
  }

  setPaused = (paused: boolean) => {
    this.paused = paused;
  };
}

class UI {
  container: HTMLElement | undefined = undefined;
  root: ShadowRoot;
  eventTarget: EventTarget;
  screenRecordingService: ScreenRecordingService;

  constructor(
    root: ShadowRoot,
    eventTarget: EventTarget,
    screenRecordingService: ScreenRecordingService,
  ) {
    this.eventTarget = eventTarget;
    this.root = root;
    this.screenRecordingService = screenRecordingService;
  }

  addControls() {
    this.container = this.buildCard();
    let timer = new Timer();
    let stopButton = new StopButton(() => {
      this.screenRecordingService.stop(this.addVideo);
    }).element;
    let pauseButton = new PauseButton(() => {
      this.screenRecordingService.pauseAndResume();
      timer.setPaused(this.screenRecordingService.isPaused());
    }).element;

    this.container.appendChild(stopButton);
    this.container.appendChild(pauseButton);
    this.container.appendChild(timer.element);
    this.root.appendChild(this.container);
  }

  removeControls = () => {
    if (this.container) {
      this.container.remove();
      this.container = undefined;
    }
  };

  addVideo = (url: string, dimensions: { width: number; height: number }) => {
    this.container = this.buildCard();
    const videoElement: HTMLVideoElement = document.createElement("video");
    const ratio = 575 / dimensions.width;
    videoElement.src = url;
    videoElement.controls = true;
    videoElement.style.margin = "24px";
    videoElement.width = dimensions.width * ratio;
    let removeButton = new RemoveButton(() => {
      this.removeControls();
      this.eventTarget.dispatchEvent(
        new CustomEvent("toggle-app", {
          detail: {
            state: false,
          },
        }),
      );
    });
    this.container.appendChild(videoElement);
    this.container.appendChild(removeButton.element);
    this.root.appendChild(this.container);
  };

  private buildCard() {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.bottom = "80px";
    div.style.left = "50%";
    div.style.zIndex = "100";
    div.style.transform = "translateX(-50%)";
    div.style.background = `linear-gradient(0deg, #13151A, #13151A), linear-gradient(0deg, #343841, #343841)`;
    div.style.border = "1px solid rgba(52, 56, 65, 1)";
    div.style.borderRadius = "12px";
    div.style.display = "grid";
    div.style.gridTemplateColumns = "1fr 1fr";
    div.style.gridTemplateRows = "auto";
    return div;
  }

  hasVideo() {
    return (
      this.container !== undefined &&
      this.container.querySelector("video") !== null
    );
  }
}

export default {
  id: "astro-screen-recorder",
  name: "Screen Recorder",
  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" data-slot="icon" class="w-6 h-6"> <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>',
  init(canvas: ShadowRoot, eventTarget: EventTarget) {
    const recorder = new ScreenRecordingService();
    const ui = new UI(canvas, eventTarget, recorder);
    eventTarget.addEventListener("app-toggled", async (event) => {
      if (
        // @ts-ignore
        event.detail.state &&
        !recorder.isRecording() &&
        !recorder.isPaused() &&
        !ui.hasVideo()
      ) {
        await recorder.start();
        ui.addControls();
      }
    });
  },
};
