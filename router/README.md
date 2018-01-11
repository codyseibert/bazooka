# Performance

`loadtest -n 100 -c 20 http://localhost:10000/snippits/d8bD20gdKdsajg/v0/users`

[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO Requests per second: 22
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO Mean latency:        813.9 ms
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO Percentage of the requests served within a certain time
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO   50%      799 ms
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO   90%      931 ms
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO   95%      1076 ms
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO   99%      1975 ms
[Tue Jan 09 2018 15:52:23 GMT-0500 (EST)] INFO  100%      1975 ms (longest request)

`loadtest -n 100 -c 10 http://localhost:10000/snippits/d8bD20gdKdsajg/v0/users`
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO Mean latency:        416.3 ms
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO Percentage of the requests served within a certain time
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO   50%      407 ms
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO   90%      498 ms
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO   95%      538 ms
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO   99%      550 ms
[Tue Jan 09 2018 15:53:35 GMT-0500 (EST)] INFO  100%      550 ms (longest request)

`loadtest -n 100 -c 5 http://localhost:10000/snippits/d8bD20gdKdsajg/v0/users`
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO Mean latency:        211.8 ms
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO Percentage of the requests served within a certain time
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO   50%      202 ms
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO   90%      249 ms
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO   95%      299 ms
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO   99%      738 ms
[Tue Jan 09 2018 15:53:58 GMT-0500 (EST)] INFO  100%      738 ms (longest request)

`loadtest -n 50 -c 1 http://localhost:10000/snippits/d8bD20gdKdsajg/v0/users`
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO Mean latency:        100.4 ms
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO Percentage of the requests served within a certain time
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO   50%      97 ms
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO   90%      107 ms
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO   95%      122 ms
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO   99%      176 ms
[Tue Jan 09 2018 16:04:00 GMT-0500 (EST)] INFO  100%      176 ms (longest request)


loadtest -n 50 --rps 5 http://localhost:10000/snippits/d8bD20gdKdsajg/count
[Wed Jan 10 2018 05:46:58 GMT+0000 (UTC)] INFO Percentage of the requests served within a certain time
[Wed Jan 10 2018 05:46:58 GMT+0000 (UTC)] INFO   50%      101 ms
[Wed Jan 10 2018 05:46:58 GMT+0000 (UTC)] INFO   90%      112 ms
[Wed Jan 10 2018 05:46:58 GMT+0000 (UTC)] INFO   95%      117 ms
[Wed Jan 10 2018 05:46:58 GMT+0000 (UTC)] INFO   99%      155 ms
[Wed Jan 10 2018 05:46:58 GMT+0000 (UTC)] INFO  100%      155 ms (longest request)