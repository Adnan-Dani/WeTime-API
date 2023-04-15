module.exports = function getDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // add 1 to convert to 1-based month
    const day = today.getDate();
    const date = `${year}-${month}-${day}`;
    return date;
}