/**
 * 歌曲对象实体
 */

export default class Song {
  /**
   * @param id
   * @param mid
   * @param singer 歌手
   * @param name
   * @param album 所属专辑
   * @param duration 歌曲时长(second)
   * @param image 图片
   * @param url 歌曲的真实请求路径
   */
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
}

/**
 * 工厂方法
 */
export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
  })
}

/**
 *
 * @param singer 格式如下:singer:{id:5062,mid:"002J4UUk29y8BY",name:"jet"}
 * @returns {*}
 */
function filterSinger (singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
