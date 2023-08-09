 function findEarliestScheduledDate(reviewItem) {

    const scheduledSessions = reviewItem.reviewSessions.filter(session => session.status === "Scheduled");
    
    // If there are no scheduled sessions, return a distant future date as a placeholder
    if (scheduledSessions.length === 0) return '9999-12-31';
    
    
    scheduledSessions.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
    return scheduledSessions[0].scheduled_date;
  }

  module.exports = findEarliestScheduledDate;
