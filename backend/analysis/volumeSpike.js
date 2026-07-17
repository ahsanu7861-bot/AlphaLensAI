function detectVolumeSpike(rvol) {

    if (rvol >= 3) {
        return {
            detected: true,
            level: "Extreme",
            signal: "Extreme Volume Spike",
            explanation:
                "Trading volume is more than three times the normal average."
        };
    }

    if (rvol >= 2) {
        return {
            detected: true,
            level: "High",
            signal: "High Volume Spike",
            explanation:
                "Trading volume is more than double the normal average."
        };
    }

    if (rvol >= 1.5) {
        return {
            detected: true,
            level: "Moderate",
            signal: "Moderate Volume Spike",
            explanation:
                "Trading volume is noticeably above average."
        };
    }

    return {
        detected: false,
        level: "Normal",
        signal: "No Volume Spike",
        explanation:
            "Trading volume is within the normal historical range."
    };

}

module.exports = {
    detectVolumeSpike
};