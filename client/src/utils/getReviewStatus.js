
function getReviewStatus(reviewSessions) {
    let numberOfScheduled = 0
    let numberOfFinished = 0
    let numberOfCanceled = 0

    reviewSessions.forEach(session => {
        if (session.status === "Scheduled") {
            numberOfScheduled++
        } else if (session.status === "Finished") {
            numberOfFinished++
        } else if (session.status === "Canceled") {
            numberOfCanceled++
        }
    })

    if (numberOfScheduled > 0) {
        return "Scheduled"
    } else if (numberOfFinished > 0) {
        return "Finished"
    } else if (numberOfCanceled === reviewSessions.length) {
        return "Canceled"
    } else {
        return "Unknown"
    }
    
  }

    export default getReviewStatus;