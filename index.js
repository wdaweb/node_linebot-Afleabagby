// 引用 line 機器人套件
import linebot from 'linebot'
// 引用 dotenv 套件
import dotenv from 'dotenv'
// 引用axios套件
import axios from 'axios'

// import fs, { appendFile } from 'fs'
// 讀取 .env
dotenv.config()

// 設定機器人
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

let MovieData = []
let VideoData = ''
let randMovie = ''

// 查詢電影名稱
const getMovieData = async (MovieName) => {
  let response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.myapi}&query=${MovieName}`)
  MovieData = response.data
  // 取得電影ID
  const MovieID = MovieData.results[0].id

  // 取得預告片key
  response = await axios.get(`https://api.themoviedb.org/3/movie/${MovieID}?api_key=${process.env.myapi}&append_to_response=videos`)
  VideoData = response.data
  let TrailerKey = ''

  TrailerKey = VideoData.videos.results[0].key

  // 製作評分星
  const score = MovieData.results[0].vote_average
  let star = ''
  if (score >= 8) {
    star = '★★★★★'
  } else if (score > 3 && score < 8) {
    star = '★★★'
  } else {
    star = '★'
  }

  // flex message 版面  電影資訊
  const flex = {
    type: 'flex',
    altText: `查詢 ${MovieName} 的結果`,
    contents: {
      type: 'carousel',
      contents: []
    }
  }

  // flex 內容
  flex.contents.contents.push(
    {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'image',
            // 電影海報
            url: `https://image.tmdb.org/t/p/w500${MovieData.results[0].poster_path}`,
            size: 'full',
            aspectMode: 'cover',
            aspectRatio: '2:3',
            gravity: 'top'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    // 電影名稱
                    text: `${MovieData.results[0].title}`,
                    size: 'xl',
                    color: '#ffffff',
                    weight: 'bold'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    color: '#ebebeb',
                    size: 'sm',
                    flex: 0,
                    // 上映日期
                    text: `${MovieData.results[0].release_date}`
                  },
                  {
                    type: 'text',
                    // Rate星星
                    text: `${star}${score}`,
                    color: '#ffffffcc',
                    decoration: 'none',
                    gravity: 'bottom',
                    flex: 0,
                    size: 'sm'
                  }
                ],
                spacing: 'lg'
              },
              {
                // 預告片連結
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'filler'
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    contents: [
                      {
                        type: 'filler'
                      },
                      {
                        type: 'icon',
                        url: 'https://www.flaticon.com/svg/static/icons/svg/1383/1383260.svg',
                        size: 'md'
                      },
                      {
                        type: 'text',
                        text: 'Trailer',
                        color: '#ffffff',
                        offsetTop: '-2px',
                        flex: 0
                      },
                      {
                        type: 'filler'
                      }
                    ],
                    spacing: 'sm',
                    action: {
                      type: 'uri',
                      label: 'action',
                      uri: `https://www.youtube.com/watch?v=${TrailerKey}`
                    }
                  },
                  {
                    type: 'filler'
                  }
                ],
                borderWidth: '1px',
                cornerRadius: '4px',
                spacing: 'sm',
                borderColor: '#ffffff',
                margin: 'xxl',
                height: '40px'
              }
            ],
            position: 'absolute',
            offsetBottom: '0px',
            offsetStart: '0px',
            offsetEnd: '0px',
            backgroundColor: '#03303Acc',
            paddingAll: '20px',
            paddingTop: '18px'
          }
        ],
        paddingAll: '0px'
      }
    }
  )
  return flex
}

// 隨機亂數 function
const getRandom = (max, min) => {
  return Math.floor(Math.random() * (max - min)) + 1
}
console.log(getRandom(500, 1))

// 熱門隨選
const randomPopular = async () => {
  // 隨機頁碼
  const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.myapi}&language=en-US&page=${getRandom(500, 1)}`)
  const randomPage = response.data
  console.log(randomPage.results.length)
  // 隨機電影
  randMovie = randomPage.results[getRandom(randomPage.results.length, 0)].title
  console.log(randMovie)
  getMovieData(randMovie)
  getMovieData(randMovie)
}
console.log(randomPopular())

// 找類型隨選函式
const genrePick = async (genreID) => {
  let genreData = ''
  const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.myapi}&with_genres=${genreID}`)
  genreData = response.data
  getMovieData(genreData.results[getRandom(genreData.results.length, 0)].title)
}
// console.log(genrePick(16))
// console.log(genrePick(16))

// 圖文選單點完，出現quick reply 類型小按鈕們
// quick reply
const quickReply = {
  type: 'text',
  text: '想看什麼類型的電影?',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Action',
          data: '28'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Animation',
          data: '16'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Comedy',
          data: '35'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Crime',
          data: '80'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Documentary',
          data: '99'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'History',
          data: '36'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Horror',
          data: '27'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Music',
          data: '10402'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Mystery',
          data: '9648'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Romance',
          data: '10749'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Science Fiction',
          data: '878'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'Thriller',
          data: '53'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'War',
          data: '10752'
        }
      }
    ]
  }
}

// LineBot處理使用者按下quickreply的函式
// const querystring = typeof import('querystring')
bot.on('postback', async event => {
  const data = event.postback.data
  if (data !== '') {
    event.reply(genrePick(data))
  }
  // if (genreID !== '') {
  //   event.reply(genrePick(genreID))
  // }
})

// 訊息事件
bot.on('message', async event => {
  // console.log(event.message.text)
  // event.reply(event.message.text)
  try {
    // 使用者輸入的訊息
    const txt = event.message.text
    // 機器人回覆
    let reply = ''
    if (txt === '找類型') {
      // 快速reply 按鈕
      reply = await quickReply
      event.reply(reply)
    } else if (txt === '熱門隨選') {
      // 隨選三部熱門片給他
      reply = await randomPopular()
      console.log(reply)
      event.reply(reply)
    } else {
      const str = txt
      reply = await getMovieData(str.replace('+', ''))
      event.reply(reply)
      console.log(reply)
    // fs.writeFile('./test.json', JSON.stringify(reply), () => {})
    // }
    }
  } catch (error) {
    console.log(error)
    event.reply('查詢失敗，請稍後再試')
  }
})

// 監聽3000 port 的東西
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})
