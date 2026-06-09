const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const glow = document.querySelector(".cursor-glow");

window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";

  glow.style.top = e.clientY + "px";
});


// Particles animation
const canvas = document.getElementById("particleCanvas");

if (canvas) {

    const size = 220;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    const centerX = size / 2;
    const centerY = size / 2;

    // Hidden canvas used to generate X coordinates

    const targetCanvas =
        document.createElement("canvas");

    targetCanvas.width = size;
    targetCanvas.height = size;

    const targetCtx =
        targetCanvas.getContext("2d");

    targetCtx.fillStyle = "white";

    targetCtx.font =
        "bold 170px Inter, sans-serif";

    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";

    targetCtx.fillText(
        "X",
        centerX,
        centerY
    );

    const imageData =
        targetCtx.getImageData(
            0,
            0,
            size,
            size
        );

    const targets = [];

    for (let y = 0; y < size; y += 4) {

        for (let x = 0; x < size; x += 4) {

            const index =
                (y * size + x) * 4;

            if (
                imageData.data[index + 3] > 100
            ) {
                targets.push({
                    x,
                    y
                });
            }
        }
    }

    const particles =
        targets.map(target => ({

            // spawn outside center area

            x:
                Math.random() > 0.5
                    ? -50
                    : size + 50,

            y:
                Math.random() * size,

            targetX:
                target.x,

            targetY:
                target.y,

            size:
                Math.random() * 1.5 + 0.5,

            alpha: 1
        }));

    let startTime =
        performance.now();

    let xRevealed = false;

    function animate(now) {

        const elapsed =
            now - startTime;

        ctx.clearRect(
            0,
            0,
            size,
            size
        );

        particles.forEach(p => {

            p.x +=
                (p.targetX - p.x)
                * 0.06;

            p.y +=
                (p.targetY - p.y)
                * 0.06;

            if (elapsed > 2200) {

                p.alpha -= 0.02;
            }

            ctx.globalAlpha =
                Math.max(
                    p.alpha,
                    0
                );

            ctx.fillStyle =
                "#00e6b8";

            // tiny square particles

            ctx.fillRect(
                p.x,
                p.y,
                p.size,
                p.size
            );
        });

        ctx.globalAlpha = 1;

        if (
            elapsed > 1800 &&
            !xRevealed
        ) {

            document
                .querySelector(".x-letter")
                .style.opacity = "1";

            xRevealed = true;
        }

        if (elapsed < 3500) {

            requestAnimationFrame(
                animate
            );
        }
    }

    requestAnimationFrame(
        animate
    );
}