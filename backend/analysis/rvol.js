function calculateRVOL(volumePrices) {

    const PERIOD = 30;

    if (volumePrices.length < PERIOD + 1) {
        return null;
    }

    const previous30Days = volumePrices.slice(-(PERIOD + 1), -1);

    const todayVolume = volumePrices[volumePrices.length - 1];

    const averageVolume =
        previous30Days.reduce((sum, volume) => sum + volume, 0) /
        previous30Days.length;

    const rvol = todayVolume / averageVolume;

    return {
        todayVolume,
        averageVolume,
        rvol
    };

}

module.exports = {
    calculateRVOL
};