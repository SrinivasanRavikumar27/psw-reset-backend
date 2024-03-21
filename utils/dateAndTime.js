// date and time  utils
const currentDate = new Date();

const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
});

const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
});

const formattedDateTime = `${formattedDate} - ${formattedTime.toLowerCase()}`;

// export 
module.exports = formattedDateTime;