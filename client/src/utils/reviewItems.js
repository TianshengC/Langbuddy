const reviewItems = [
    {
        "id_review": 1,
        "id_user": "user1",
        "category": "Vocabulary",
        "title": "English Vocabulary Review 1",
        "content": "Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.Long list of vocabulary words.",
        "created_date": "2023-05-01T00:00:00.000Z",
        "reviewSessions": [
            {
                "id_session": 1,
                "scheduled_date": "2023-05-02",
                "finished_date": null,
                "status": "Scheduled",
                "session_number": 1
            },
            {
                "id_session": 2,
                "scheduled_date": "2023-05-03",
                "finished_date": null,
                "status": "Scheduled",
                "session_number": 2
            },
            {
                "id_session": 3,
                "scheduled_date": "2023-05-03",
                "finished_date": "2023-05-03",
                "status": "Canceled",
                "session_number": 3
            },
        ],
        "totalSessions": 7,
        "completedSessions": 0
    },
    
    
    {

            "id_review": 2,
            "id_user": "user2",
            "category": "Reading",
            "title": "Reading Comprehension Review 1",
            "content": "Review Passage 1",
            "created_date": "2023-06-01T00:00:00.000Z",
       
        "reviewSessions": [
            {
                "id_session": 4,
                "id_review": 2,
                "created_date": "2023-06-01T00:00:00.000Z",
                "scheduled_date": "2023-06-02T23:00:00.000Z",
                "finished_date": "2023-06-02",
                "status": "Finished",
            },
            {
                "id_session": 5,
                "id_review": 2,
                "created_date": "2023-06-01T00:00:00.000Z",
                "scheduled_date": "2023-06-03T23:00:00.000Z",
                "finished_date": null,
                "status": "Scheduled",
            },
            {
                "id_session": 6,
                "id_review": 2,
                "created_date": "2023-06-01T00:00:00.000Z",
                "scheduled_date": "2023-06-04T23:00:00.000Z",
                "finished_date": "2023-06-04",
                "status": "Canceled",
            }
        ],
    },
    {

            "id_review": 3,
            "id_user": "user3",
            "category": "Listening",
            "title": "Listening Comprehension Review 1",
            "content": "Review Audio Clip 1",
            "created_date": "2023-07-01T00:00:00.000Z",
        "reviewSessions": [
            {
                "id_session": 7,
                "id_review": 3,
                "created_date": "2023-07-01T00:00:00.000Z",
                "scheduled_date": "2023-07-02",
                "finished_date": null,
                "status": "Scheduled",
                "session_number": 1
            },
            {
                "id_session": 8,
                "id_review": 3,
                "created_date": "2023-07-01T00:00:00.000Z",
                "scheduled_date": "2023-07-03",
                "finished_date": "2023-07-03",
                "status": "Finished",
                "session_number": 2
            },
            {
                "id_session": 9,
                "id_review": 3,
                "created_date": "2023-07-01T00:00:00.000Z",
                "scheduled_date": "2023-07-04",
                "finished_date": null,
                "status": "Scheduled",
                "session_number": 3
            }
        ],
        "totalSessions": 3,
        "completedSessions": 1
    }
]


export default reviewItems;