// Convenience function to return today's date as a string
function today() {
    var currentDate = new Date()
    var day = currentDate.getDate()
    var month = currentDate.getMonth() + 1
    var year = currentDate.getFullYear()
    return year + "-" + month + "-" + day
}
