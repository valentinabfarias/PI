(function () {
    const MAX_KEY = "journey-max-unlocked";

    function getMaxUnlocked() {
        const raw = parseInt(localStorage.getItem(MAX_KEY) || "0", 10);
        return Number.isFinite(raw) && raw >= 0 ? raw : 0;
    }

    function setCurrentStage(index) {
        const max = Math.max(0, index);
        localStorage.setItem(MAX_KEY, String(max));
        sessionStorage.setItem("mapIndex", String(max));
        return max;
    }

    function setMaxUnlocked(index) {
        const next = Math.max(getMaxUnlocked(), index);
        return setCurrentStage(next);
    }

    function completeStage(stageIndex) {
        const next = stageIndex + 1;
        return setMaxUnlocked(next);
    }

    function revertOneStage() {
        const current = getMaxUnlocked();
        if (current <= 0) {
            return null;
        }
        return setCurrentStage(current - 1);
    }

    function isStageUnlocked(stageIndex) {
        return stageIndex <= getMaxUnlocked();
    }

    function isStageCurrent(stageIndex) {
        return stageIndex === getMaxUnlocked();
    }

    window.PIJourney = {
        getMaxUnlocked,
        setMaxUnlocked,
        setCurrentStage,
        completeStage,
        revertOneStage,
        isStageUnlocked,
        isStageCurrent,
    };
})();
