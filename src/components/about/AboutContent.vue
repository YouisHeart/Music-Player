<script setup>
import AppIcon from '@/components/common/AppIcon.vue'
import LogoMark from '@/components/layout/LogoMark.vue'

const features = [
  '本地导入',
  '无损格式',
  '歌词同步',
  '自定义外观',
  '频谱可视化',
  '完全离线',
]

const tech = ['Vue 3', 'Vite', 'Pinia', 'VueUse', 'Web Audio', 'IndexedDB']

const shortcuts = [
  { key: 'Space', label: '播放 / 暂停' },
  { key: 'N / P', label: '下一首 / 上一首' },
  { key: '← / →', label: '快退 / 快进 5 秒' },
]
</script>

<template>
  <div class="about-content">
    <div class="about-hero">
      <LogoMark :size="60" />
      <div>
        <p class="eyebrow">CYBER AUDIO SYSTEM</p>
        <h2>Music Player</h2>
        <p class="about-version">VERSION 1.0.0 · BUILD 2026.11</p>
      </div>
    </div>

    <p class="about-desc">
      一个完全运行在本地的高质感音乐播放器。深海蓝与霓虹紫构成的暗黑玻璃界面，让每一次播放都像驶入一条发光的赛博街道。无需账号、无需联网，你的音乐只属于你。
    </p>

    <div class="about-features">
      <span v-for="feature in features" :key="feature" class="chip">
        <AppIcon name="sparkles" :size="10" />
        {{ feature }}
      </span>
    </div>

    <div class="about-grid">
      <section class="about-block">
        <h4>TECH STACK</h4>
        <div class="about-tech">
          <span v-for="item in tech" :key="item">{{ item }}</span>
        </div>
      </section>

      <section class="about-block">
        <h4>SHORTCUTS</h4>
        <ul class="about-shortcuts">
          <li v-for="item in shortcuts" :key="item.key">
            <kbd>{{ item.key }}</kbd>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>

      <section class="about-block about-block--wide">
        <h4>CREDITS &amp; PRIVACY</h4>
        <p>
          视觉素材由 AI 生成并经本地后期处理；演示音乐由 numpy 程序化合成、LAME 编码，均为本项目原创内容。
        </p>
        <p>
          应用不含后端、账号或遥测。音乐文件、播放进度与个性化设置全部保存在本机浏览器存储中，不会上传到任何服务器。
        </p>
      </section>
    </div>

    <p class="about-foot">© 2026 CYBER AUDIO LAB · LOCAL-FIRST MUSIC PLAYER</p>
  </div>
</template>

<style scoped>
.about-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 26px 28px 24px;
}

.about-hero {
  display: flex;
  gap: 16px;
  align-items: center;
}

.about-hero .eyebrow {
  color: var(--text-3);
  font-size: 8px;
  letter-spacing: 0.24em;
}

.about-hero h2 {
  margin-top: 3px;
  color: #fff;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.about-version {
  margin-top: 4px;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.16em;
}

.about-desc {
  color: var(--text-2);
  font-size: 12.5px;
  line-height: 1.9;
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.about-features .chip {
  height: 25px;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: none;
}

.about-features .chip :deep(.app-icon) {
  color: var(--neon);
}

.about-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr 1fr;
  padding-top: 4px;
  border-top: 1px solid var(--line);
}

.about-block {
  padding-top: 14px;
}

.about-block--wide {
  grid-column: 1 / -1;
}

.about-block h4 {
  margin-bottom: 9px;
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.2em;
}

.about-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.about-tech span {
  padding: 4px 9px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-2);
  font-size: 10px;
}

.about-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.about-shortcuts li {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--text-3);
  font-size: 10.5px;
}

.about-shortcuts kbd {
  min-width: 54px;
  padding: 2px 7px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-2);
  font-family: var(--font-display);
  font-size: 8px;
  text-align: center;
}

.about-block p {
  color: var(--text-3);
  font-size: 11px;
  line-height: 1.85;
}

.about-block p + p {
  margin-top: 6px;
}

.about-foot {
  padding-top: 6px;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.18em;
  text-align: center;
}
</style>
