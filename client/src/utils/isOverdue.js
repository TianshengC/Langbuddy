const isOverdue = (dateObj) => {
    const today = new Date();

    // reset the hours, minutes, seconds, and milliseconds for both dates
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    return dateObj < today;
};

export default isOverdue;