const params = new URLSearchParams(window.location.search);

function setFrameForItem(item, frame) {
    if (!item || !frame) return;

    // Prefer local HTML if present, otherwise external URL
    const hasHtml = !!item.html;
    const hasUrl = !!item.url;

    // 🔹 If noProxy is set, ALWAYS load directly (no UV)
    if (item.noProxy) {
        if (hasHtml) {
            frame.src = item.html;
        } else if (hasUrl) {
            frame.src = item.url;
        } else {
            console.error("Item has no html or url:", item.id);
        }
        return;
    }

    // 🔹 Default behavior:
    // - Local html: load directly
    // - Remote url: go through UV proxy
    if (hasHtml) {
        frame.src = item.html; // local file, no proxy
    } else if (hasUrl) {
        frame.src = __uv$config.prefix + __uv$config.encodeUrl(item.url); // proxy
    } else {
        console.error("Item has no html or url:", item.id);
    }
}



if (!getObj("favoritedGames")) setObj("favoritedGames", []);
if (!getObj("favoritedApps")) setObj("favoritedApps", []);

var favoritedButton = document.querySelector(".favorited");
var favoritedGames = getObj("favoritedGames");
var favoritedApps = getObj("favoritedApps");

var game = params.get("game");
var app = params.get("app");

if (favoritedGames.includes(game)) {
    favoritedButton.classList.remove("far");
    favoritedButton.classList.add("fas");
}

function favorite() {
    if (game) {
        var index = favoritedGames.indexOf(game);
        if (index !== -1) {
            favoritedGames.splice(index, 1);
            favoritedButton.classList.remove("fas");
            favoritedButton.classList.add("far");
        } else {
            favoritedGames.push(game);
            favoritedButton.classList.remove("far");
            favoritedButton.classList.add("fas");
        }
        setObj("favoritedGames", favoritedGames);
    } else if (app) {
        var index = favoritedApps.indexOf(app);
        if (index !== -1) {
            favoritedApps.splice(index, 1);
            favoritedButton.classList.remove("fas");
            favoritedButton.classList.add("far");
        } else {
            favoritedApps.push(app);
            favoritedButton.classList.remove("far");
            favoritedButton.classList.add("fas");
        }
        setObj("favoritedApps", favoritedApps);
    }

}
