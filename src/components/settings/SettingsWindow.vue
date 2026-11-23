<script setup>
import { computed, reactive, ref } from 'vue'

import AboutContent from '@/components/about/AboutContent.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import ModalShell from '@/components/common/ModalShell.vue'
import NeonSlider from '@/components/common/NeonSlider.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import EqCurve from '@/components/settings/EqCurve.vue'
import VinylThumb from '@/components/settings/VinylThumb.vue'
import { EQ_BANDS, EQ_PRESETS, NEON_PRESETS, VINYL_SKINS, WALLPAPERS } from '@/data/presets'
import { usePlayerStore } from '@/stores/player'
import { DEFAULT_SETTINGS, sanitizeSettings, useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'
import { imageFileToDataUrl } from '@/utils/image'

const settingsStore = useSettingsStore()
const player = usePlayerStore()
const ui = useUiStore()

const initialSettings = JSON.parse(JSON.stringify(settingsStore.settings))
initialSettings.defaultVolume = player.volume
const draft = reactive(sanitizeSettings(initialSettings))
const baseline = sanitizeSettings(JSON.parse(JSON.stringify(initialSettings)))
const activeTab = ref('appearance')
const wallpaperInput = ref(null)
const coverInput = ref(null)

const tabs = [
  { id: 'appearance', label: '外观设置', icon: 'palette', hint: 'APPEARANCE' },
  { id: 'playback', label: '播放设置', icon: 'play', hint: 'PLAYBACK' },
  { id: 'audio', label: '音效设置', icon: 'equalizer', hint: 'AUDIO' },
  { id: 'shortcuts', label: '快捷键', icon: 'keyboard', hint: 'SHORTCUTS' },
  { id: 'about', label: '关于软件', icon: 'info', hint: 'ABOUT' },
]

const repeatOptions = [
  { id: 'off', label: '顺序播放' },
  { id: 'all', label: '列表循环' },
  { id: 'one', label: '单曲循环' },
]

const shortcuts = [
  { keys: ['Space'], label: '播放 / 暂停' },
  { keys: ['N'], label: '下一首' },
  { keys: ['P'], label: '上一首' },
  { keys: ['←', '→'], label: '快退 / 快进 5 秒' },
  { keys: ['Shift', '←', '→'], label: '快退 / 快进 15 秒' },
  { keys: ['↑', '↓'], label: '音量调节 5%' },
  { keys: ['M'], label: '静音 / 取消静音' },
  { keys: ['S'], label: '随机播放开关' },
  { keys: ['R'], label: '切换循环模式' },
  { keys: ['L'], label: '收藏当前歌曲' },
  { keys: ['/'], label: '聚焦曲库搜索' },
  { keys: ['Esc'], label: '关闭当前面板' },
]

const currentTrack = computed(() => player.currentTrack)
const currentCover = computed(() => {
  if (!currentTrack.value) return ''
  return draft.coverOverrides[currentTrack.value.id] || currentTrack.value.cover || ''
})

const dirty = computed(() => JSON.stringify(draft) !== JSON.stringify(baseline))
const isCustomWallpaper = computed(() => draft.wallpaper.type === 'custom')

function selectPresetTab(tab) {
  activeTab.value = tab
}

function chooseWallpaper() {
  wallpaperInput.value?.click()
}

function chooseCover() {
  if (!currentTrack.value) {
    ui.toast('请先播放一首歌曲，再自定义唱片封面', 'info', 2600)
    return
  }
  coverInput.value?.click()
}

function imageErrorMessage(error) {
  if (error?.message === 'IMAGE_TYPE') return '请选择图片文件（PNG / JPG / WebP）'
  if (error?.message === 'IMAGE_SIZE') return '图片不能超过 30 MB'
  return '图片处理失败，请换一张试试'
}

async function onWallpaperSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    const dataUrl = await imageFileToDataUrl(file, { width: 1920, height: 1080, quality: 0.82 })
    draft.wallpaper = { type: 'custom', dataUrl }
    ui.toast('自定义壁纸已就绪，保存后生效', 'success', 2200)
  } catch (error) {
    ui.toast(imageErrorMessage(error), 'error', 3000)
  }
}

async function onCoverSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || !currentTrack.value) return
  try {
    const dataUrl = await imageFileToDataUrl(file, { width: 900, height: 900, quality: 0.86 })
    draft.coverOverrides[currentTrack.value.id] = dataUrl
    ui.toast('唱片封面已更新，保存后生效', 'success', 2200)
  } catch (error) {
    ui.toast(imageErrorMessage(error), 'error', 3000)
  }
}

function resetCover() {
  if (!currentTrack.value) return
  delete draft.coverOverrides[currentTrack.value.id]
}

function resetWallpaper() {
  draft.wallpaper = { ...DEFAULT_SETTINGS.wallpaper }
}

function resetAppearance() {
  draft.wallpaper = { ...DEFAULT_SETTINGS.wallpaper }
  draft.backgroundBlur = DEFAULT_SETTINGS.backgroundBlur
  draft.neonPreset = DEFAULT_SETTINGS.neonPreset
  draft.neonCustom = DEFAULT_SETTINGS.neonCustom
  draft.effects = DEFAULT_SETTINGS.effects
  draft.vinylSkin = DEFAULT_SETTINGS.vinylSkin
}

function applyEqPreset(preset) {
  draft.eq.preset = preset.id
  draft.eq.bands = [...preset.bands]
  draft.eq.enabled = true
}

function updateBand(index, value) {
  const bands = [...draft.eq.bands]
  bands[index] = value
  draft.eq.bands = bands
  draft.eq.preset = 'custom'
}

function resetEq() {
  draft.eq = { enabled: false, preset: 'flat', bands: [0, 0, 0] }
}

function save() {
  settingsStore.replace(draft)
  player.setVolume(draft.defaultVolume)
  ui.toast('设置已保存', 'success', 2000)
  ui.closeSettings()
}

const percent = (value) => `${Math.round(value * 100)}%`
const decibels = (value) => `${value > 0 ? '+' : ''}${value} dB`
</script>

<template>
  <ModalShell
    title="个性设置"
    subtitle="PERSONALIZE YOUR PLAYER"
    icon="settings"
    width="1010px"
    :close-on-backdrop="false"
    @close="ui.closeSettings()"
  >
    <div class="settings-window">
      <nav class="settings-nav" aria-label="设置分类">
        <div class="settings-nav__list">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="settings-nav__item"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="selectPresetTab(tab.id)"
          >
            <span class="settings-nav__icon"><AppIcon :name="tab.icon" :size="17" /></span>
            <span class="settings-nav__text">
              <span class="settings-nav__label">{{ tab.label }}</span>
              <span class="settings-nav__hint">{{ tab.hint }}</span>
            </span>
          </button>
        </div>
        <p class="settings-nav__foot">
          <span class="status-dot" />
          设置仅保存在本机
        </p>
      </nav>

      <div class="settings-content scroll-area">
        <Transition name="settings-tab" mode="out-in">
          <div v-if="activeTab === 'appearance'" key="appearance" class="settings-tab">
            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>背景图片</h3>
                  <p>选择一张壁纸，或上传你自己的画面。</p>
                </div>
                <button v-if="isCustomWallpaper" type="button" class="link-button" @click="resetWallpaper">
                  恢复默认
                </button>
              </header>

              <div class="wallpaper-grid">
                <button
                  v-for="preset in WALLPAPERS"
                  :key="preset.id"
                  type="button"
                  class="wallpaper-tile"
                  :class="{ 'is-active': draft.wallpaper.type === 'preset' && draft.wallpaper.id === preset.id }"
                  @click="draft.wallpaper = { type: 'preset', id: preset.id }"
                >
                  <img :src="preset.src" :alt="preset.name" loading="lazy" />
                  <span class="wallpaper-tile__shade" />
                  <span class="wallpaper-tile__name">{{ preset.name }}</span>
                  <span
                    v-if="draft.wallpaper.type === 'preset' && draft.wallpaper.id === preset.id"
                    class="wallpaper-tile__check"
                  >
                    <AppIcon name="check" :size="12" />
                  </span>
                </button>

                <button
                  type="button"
                  class="wallpaper-tile wallpaper-tile--custom"
                  :class="{ 'is-active': isCustomWallpaper }"
                  @click="chooseWallpaper"
                >
                  <img v-if="isCustomWallpaper" :src="draft.wallpaper.dataUrl" alt="自定义壁纸" />
                  <span v-else class="wallpaper-tile__placeholder">
                    <AppIcon name="image" :size="20" />
                    <span>上传图片</span>
                  </span>
                  <span class="wallpaper-tile__shade" />
                  <span class="wallpaper-tile__name">{{ isCustomWallpaper ? '更换自定义' : '自定义壁纸' }}</span>
                  <span v-if="isCustomWallpaper" class="wallpaper-tile__check">
                    <AppIcon name="check" :size="12" />
                  </span>
                </button>
              </div>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>背景模糊</h4>
                  <p>数值越高，壁纸越朦胧，界面层次也越明显。</p>
                </div>
                <div class="setting-row__control">
                  <NeonSlider
                    class="setting-slider"
                    :model-value="draft.backgroundBlur"
                    :min="0"
                    :max="24"
                    :step="1"
                    label="背景模糊"
                    @update:model-value="(value) => (draft.backgroundBlur = value)"
                  />
                  <span class="setting-value">{{ draft.backgroundBlur }}px</span>
                </div>
              </div>
            </section>

            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>霓虹光效</h3>
                  <p>选择主色，按钮、光环与频谱都会随之变化。</p>
                </div>
              </header>

              <div class="swatch-row">
                <button
                  v-for="preset in NEON_PRESETS"
                  :key="preset.id"
                  type="button"
                  class="neon-swatch"
                  :class="{ 'is-active': draft.neonPreset === preset.id }"
                  :style="{ '--swatch': preset.color }"
                  :title="preset.name"
                  :aria-label="preset.name"
                  @click="draft.neonPreset = preset.id"
                >
                  <span class="neon-swatch__dot" />
                  <span v-if="draft.neonPreset === preset.id" class="neon-swatch__check">
                    <AppIcon name="check" :size="11" />
                  </span>
                </button>

                <label
                  class="neon-swatch neon-swatch--custom"
                  :class="{ 'is-active': draft.neonPreset === 'custom' }"
                  :style="{ '--swatch': draft.neonCustom }"
                  title="自定义颜色"
                >
                  <span class="neon-swatch__dot" />
                  <input
                    type="color"
                    :value="draft.neonCustom"
                    aria-label="自定义霓虹颜色"
                    @input="
                      (event) => {
                        draft.neonCustom = event.target.value
                        draft.neonPreset = 'custom'
                      }
                    "
                  />
                  <span v-if="draft.neonPreset === 'custom'" class="neon-swatch__check">
                    <AppIcon name="check" :size="11" />
                  </span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>动态视觉效果</h4>
                  <p>关闭后停止极光、粒子、唱片光环等装饰动画，降低 GPU 占用。</p>
                </div>
                <ToggleSwitch v-model="draft.effects" label="动态视觉效果" />
              </div>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>频谱可视化</h4>
                  <p>在播放界面左下角显示实时频谱，需要 Web Audio 支持。</p>
                </div>
                <ToggleSwitch v-model="draft.showSpectrum" label="频谱可视化" />
              </div>
            </section>

            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>唱片样式</h3>
                  <p>为黑胶选择不同的材质与光晕，或上传当前歌曲的中心封面。</p>
                </div>
                <button
                  v-if="currentTrack && draft.coverOverrides[currentTrack.id]"
                  type="button"
                  class="link-button"
                  @click="resetCover"
                >
                  恢复歌曲封面
                </button>
              </header>

              <div class="vinyl-options">
                <button
                  v-for="skin in VINYL_SKINS"
                  :key="skin.id"
                  type="button"
                  class="vinyl-option"
                  :class="{ 'is-active': draft.vinylSkin === skin.id }"
                  @click="draft.vinylSkin = skin.id"
                >
                  <VinylThumb :skin="skin" :cover="currentCover" :active="draft.vinylSkin === skin.id" />
                  <span class="vinyl-option__name">{{ skin.name }}</span>
                  <span class="vinyl-option__hint">{{ skin.hint }}</span>
                </button>

                <button
                  type="button"
                  class="vinyl-option vinyl-option--upload"
                  :disabled="!currentTrack"
                  @click="chooseCover"
                >
                  <span class="vinyl-upload">
                    <AppIcon name="uploadCloud" :size="20" />
                  </span>
                  <span class="vinyl-option__name">自定义封面</span>
                  <span class="vinyl-option__hint">{{ currentTrack ? currentTrack.title : '暂无歌曲' }}</span>
                </button>
              </div>

              <p class="setting-note">
                <AppIcon name="info" :size="12" />
                自定义封面仅应用到当前播放的歌曲，并随设置一起保存。
              </p>
            </section>

            <div class="setting-actions">
              <button type="button" class="ghost-button" @click="resetAppearance">
                <AppIcon name="reset" :size="13" />
                恢复默认外观
              </button>
            </div>
          </div>

          <div v-else-if="activeTab === 'playback'" key="playback" class="settings-tab">
            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>播放行为</h3>
                  <p>控制歌曲结束后的动作与启动状态。</p>
                </div>
              </header>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>播放完自动下一首</h4>
                  <p>关闭后，歌曲结束会停留在当前曲目。</p>
                </div>
                <ToggleSwitch v-model="draft.autoplay" label="播放完自动下一首" />
              </div>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>启动时恢复上次播放</h4>
                  <p>记住上次的歌曲与进度，下次打开时继续。</p>
                </div>
                <ToggleSwitch v-model="draft.restoreLast" label="启动时恢复上次播放" />
              </div>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>播放音量</h4>
                  <p>保存后立即应用到播放器；下次启动沿用最后一次的音量。</p>
                </div>
                <div class="setting-row__control">
                  <NeonSlider
                    class="setting-slider"
                    :model-value="draft.defaultVolume"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    label="播放音量"
                    @update:model-value="(value) => (draft.defaultVolume = value)"
                  />
                  <span class="setting-value">{{ percent(draft.defaultVolume) }}</span>
                </div>
              </div>
            </section>

            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>循环方式</h3>
                  <p>设置队列播放到结尾时的行为。</p>
                </div>
              </header>

              <div class="segmented">
                <button
                  v-for="option in repeatOptions"
                  :key="option.id"
                  type="button"
                  class="segmented__item"
                  :class="{ 'is-active': draft.repeatMode === option.id }"
                  @click="draft.repeatMode = option.id"
                >
                  {{ option.label }}
                </button>
              </div>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>随机播放</h4>
                  <p>从当前队列中随机选择下一首。</p>
                </div>
                <ToggleSwitch v-model="draft.shuffle" label="随机播放" />
              </div>
            </section>
          </div>

          <div v-else-if="activeTab === 'audio'" key="audio" class="settings-tab">
            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>均衡器</h3>
                  <p>基于 Web Audio 的三段均衡，实时作用于播放输出。</p>
                </div>
                <button type="button" class="link-button" @click="resetEq">重置</button>
              </header>

              <div class="setting-row">
                <div class="setting-row__copy">
                  <h4>启用均衡器</h4>
                  <p>关闭时保持原始音频，不做任何频段增益。</p>
                </div>
                <ToggleSwitch v-model="draft.eq.enabled" label="启用均衡器" />
              </div>

              <div class="eq-presets">
                <button
                  v-for="preset in EQ_PRESETS"
                  :key="preset.id"
                  type="button"
                  class="eq-chip"
                  :class="{ 'is-active': draft.eq.preset === preset.id }"
                  @click="applyEqPreset(preset)"
                >
                  {{ preset.name }}
                </button>
              </div>

              <div class="eq-visual" :class="{ 'is-disabled': !draft.eq.enabled }">
                <EqCurve :bands="draft.eq.bands" :enabled="draft.eq.enabled" />
              </div>

              <div class="eq-bands" :class="{ 'is-disabled': !draft.eq.enabled }">
                <div v-for="(band, index) in EQ_BANDS" :key="band.id" class="eq-band">
                  <div class="eq-band__head">
                    <span>{{ band.label }}</span>
                    <em>{{ band.frequency }}</em>
                  </div>
                  <NeonSlider
                    :model-value="draft.eq.bands[index]"
                    :min="-12"
                    :max="12"
                    :step="1"
                    :label="`${band.label}增益`"
                    :format-value="decibels"
                    @update:model-value="(value) => updateBand(index, value)"
                  />
                  <span class="eq-band__value">{{ decibels(draft.eq.bands[index]) }}</span>
                </div>
              </div>

              <p class="setting-note">
                <AppIcon name="info" :size="12" />
                部分浏览器在 file:// 环境下会限制音频处理，此时均衡器将自动旁路，不影响正常播放。
              </p>
            </section>
          </div>

          <div v-else-if="activeTab === 'shortcuts'" key="shortcuts" class="settings-tab">
            <section class="setting-section">
              <header class="setting-section__head">
                <div>
                  <h3>键盘快捷键</h3>
                  <p>无需离开键盘，完成大多数播放操作。</p>
                </div>
              </header>

              <ul class="shortcut-list">
                <li v-for="item in shortcuts" :key="item.label" class="shortcut-row">
                  <span class="shortcut-row__label">{{ item.label }}</span>
                  <span class="shortcut-row__keys">
                    <kbd v-for="key in item.keys" :key="key">{{ key }}</kbd>
                  </span>
                </li>
              </ul>
            </section>
          </div>

          <div v-else key="about" class="settings-tab">
            <AboutContent />
          </div>
        </Transition>
      </div>
    </div>

    <input ref="wallpaperInput" type="file" accept="image/*" class="visually-hidden" @change="onWallpaperSelected" />
    <input ref="coverInput" type="file" accept="image/*" class="visually-hidden" @change="onCoverSelected" />

    <template #footer>
      <span class="settings-status">
        <i :class="{ 'is-dirty': dirty }" />
        {{ dirty ? '有未保存的更改' : '所有更改已保存' }}
      </span>
      <button type="button" class="ghost-button" @click="ui.closeSettings()">取消</button>
      <button type="button" class="primary-button" @click="save">
        <AppIcon name="check" :size="14" />
        保存设置
      </button>
    </template>
  </ModalShell>
</template>

<style scoped>
.settings-window {
  display: flex;
  height: 100%;
  min-height: 0;
}

.settings-nav {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 198px;
  padding: 16px 12px;
  border-right: 1px solid var(--line);
  background: rgba(3, 8, 18, 0.24);
}

.settings-nav__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-nav__item {
  display: flex;
  gap: 11px;
  align-items: center;
  height: 50px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 11px;
  color: var(--text-2);
  text-align: left;
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.settings-nav__item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-1);
}

.settings-nav__item.is-active {
  border-color: rgba(var(--neon-rgb), 0.32);
  background: linear-gradient(100deg, rgba(var(--neon-rgb), 0.22), rgba(var(--neon-2-rgb), 0.08));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #fff;
}

.settings-nav__icon {
  display: grid;
  flex: none;
  width: 24px;
  place-items: center;
  color: var(--text-2);
}

.settings-nav__item.is-active .settings-nav__icon {
  color: var(--neon);
}

.settings-nav__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.settings-nav__label {
  font-size: 12px;
  font-weight: 500;
}

.settings-nav__hint {
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7px;
  letter-spacing: 0.14em;
}

.settings-nav__foot {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: auto;
  padding: 10px 6px 2px;
  color: var(--text-4);
  font-size: 9px;
}

.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 7px rgba(61, 220, 151, 0.8);
}

.settings-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.settings-tab {
  padding: 22px 26px 26px;
}

.setting-section {
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}

.setting-section + .setting-section {
  padding-top: 22px;
}

.setting-section:last-of-type {
  border-bottom: 0;
}

.setting-section__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 15px;
}

.setting-section__head h3 {
  color: var(--text-1);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.setting-section__head p {
  margin-top: 4px;
  color: var(--text-3);
  font-size: 10.5px;
  line-height: 1.6;
}

.link-button {
  flex: none;
  color: var(--neon);
  font-size: 10px;
  letter-spacing: 0.02em;
}

.link-button:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 9px;
}

.wallpaper-tile {
  position: relative;
  aspect-ratio: 16 / 9.5;
  overflow: hidden;
  border: 1px solid rgba(140, 185, 255, 0.12);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.03);
  transition:
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.wallpaper-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s var(--ease);
}

.wallpaper-tile:hover {
  border-color: rgba(var(--neon-rgb), 0.4);
  transform: translateY(-2px);
}

.wallpaper-tile:hover img {
  transform: scale(1.05);
}

.wallpaper-tile.is-active {
  border-color: rgba(var(--neon-rgb), 0.85);
  box-shadow:
    0 0 0 2px rgba(var(--neon-rgb), 0.16),
    0 8px 24px rgba(0, 0, 0, 0.32);
}

.wallpaper-tile__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(3, 8, 17, 0.85));
  pointer-events: none;
}

.wallpaper-tile__name {
  position: absolute;
  right: 7px;
  bottom: 5px;
  left: 7px;
  overflow: hidden;
  color: rgba(240, 247, 255, 0.9);
  font-size: 9px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallpaper-tile__check {
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 12px rgba(var(--neon-rgb), 0.7);
  color: #050a14;
}

.wallpaper-tile--custom {
  border-style: dashed;
}

.wallpaper-tile__placeholder {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-3);
  font-size: 8.5px;
}

.setting-row {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
}

.setting-row + .setting-row {
  margin-top: 14px;
  border-top: 1px solid rgba(140, 180, 255, 0.06);
}

.setting-row__copy h4 {
  color: var(--text-1);
  font-size: 11.5px;
  font-weight: 500;
}

.setting-row__copy p {
  margin-top: 3px;
  color: var(--text-3);
  font-size: 9.5px;
  line-height: 1.6;
}

.setting-row__control {
  display: flex;
  flex: none;
  gap: 11px;
  align-items: center;
  width: min(300px, 42%);
}

.setting-slider {
  flex: 1;
}

.setting-value {
  flex: none;
  width: 46px;
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-align: right;
}

.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.neon-swatch {
  position: relative;
  display: grid;
  width: 38px;
  height: 38px;
  border: 2px solid transparent;
  border-radius: 50%;
  place-items: center;
  transition:
    border-color 0.2s var(--ease),
    box-shadow 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.neon-swatch:hover {
  transform: scale(1.06);
}

.neon-swatch__dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--swatch);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.35),
    0 0 14px var(--swatch);
}

.neon-swatch.is-active {
  border-color: #fff;
  box-shadow:
    0 0 0 3px rgba(var(--neon-rgb), 0.16),
    0 0 18px var(--swatch);
}

.neon-swatch__check {
  position: absolute;
  display: grid;
  width: 15px;
  height: 15px;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  color: #08101f;
}

.neon-swatch--custom {
  background: conic-gradient(#ff5f6d, #ffc371, #5eead4, #4f8dff, #a855f7, #ff5f6d);
}

.neon-swatch--custom .neon-swatch__dot {
  background: var(--swatch);
}

.neon-swatch--custom input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  opacity: 0;
  cursor: pointer;
}

.setting-note {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  margin-top: 16px;
  padding: 10px 12px;
  border: 1px solid rgba(140, 185, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
  color: var(--text-3);
  font-size: 9.5px;
  line-height: 1.6;
}

.setting-note :deep(.app-icon) {
  margin-top: 2px;
  color: var(--text-3);
}

.vinyl-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vinyl-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  width: 88px;
  padding: 7px 4px 8px;
  border: 1px solid transparent;
  border-radius: 11px;
  color: var(--text-3);
  transition:
    background 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.vinyl-option:hover {
  background: rgba(255, 255, 255, 0.035);
}

.vinyl-option.is-active {
  border-color: rgba(var(--neon-rgb), 0.28);
  background: rgba(var(--neon-rgb), 0.06);
}

.vinyl-option__name {
  margin-top: 3px;
  color: var(--text-2);
  font-size: 9.5px;
}

.vinyl-option.is-active .vinyl-option__name {
  color: var(--text-1);
}

.vinyl-option__hint {
  color: var(--text-4);
  font-size: 7.5px;
}

.vinyl-upload {
  display: grid;
  width: 72px;
  height: 72px;
  border: 1px dashed rgba(var(--neon-rgb), 0.32);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-3);
  place-items: center;
}

.vinyl-option--upload {
  color: var(--text-3);
}

.vinyl-option--upload:hover .vinyl-upload {
  border-color: rgba(var(--neon-rgb), 0.55);
  color: var(--neon);
}

.setting-actions {
  display: flex;
  justify-content: flex-start;
  padding-top: 20px;
}

.setting-actions .ghost-button {
  height: 32px;
  font-size: 10.5px;
}

.segmented {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: rgba(5, 11, 22, 0.45);
}

.segmented__item {
  height: 28px;
  padding: 0 16px;
  border-radius: 7px;
  color: var(--text-3);
  font-size: 10.5px;
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.segmented__item.is-active {
  background: linear-gradient(135deg, rgba(var(--neon-rgb), 0.9), rgba(var(--neon-2-rgb), 0.8));
  box-shadow: 0 4px 14px rgba(var(--neon-rgb), 0.24);
  color: #fff;
}

.eq-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 16px;
}

.eq-chip {
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-3);
  font-size: 10px;
  transition:
    color 0.2s var(--ease),
    border-color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.eq-chip:hover {
  color: var(--text-1);
}

.eq-chip.is-active {
  border-color: rgba(var(--neon-rgb), 0.4);
  background: rgba(var(--neon-rgb), 0.12);
  color: var(--neon);
}

.eq-bands {
  display: grid;
  gap: 14px;
  margin-top: 18px;
  transition: opacity 0.25s var(--ease);
}

.eq-bands.is-disabled {
  opacity: 0.45;
}

.eq-band {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) 54px;
  gap: 14px;
  align-items: center;
}

.eq-band__head {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.eq-band__head span {
  color: var(--text-2);
  font-size: 10.5px;
}

.eq-band__head em {
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  font-style: normal;
  letter-spacing: 0.08em;
}

.eq-band__value {
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 9px;
  text-align: right;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.06);
}

.shortcut-row:last-child {
  border-bottom: 0;
}

.shortcut-row__label {
  color: var(--text-2);
  font-size: 11px;
}

.shortcut-row__keys {
  display: flex;
  gap: 5px;
  align-items: center;
}

.shortcut-row kbd {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-2);
  font-family: var(--font-display);
  font-size: 8px;
  line-height: 20px;
  text-align: center;
}

.settings-status {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-right: auto;
  color: var(--text-3);
  font-size: 9.5px;
}

.settings-status i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 7px rgba(61, 220, 151, 0.7);
}

.settings-status i.is-dirty {
  background: var(--warning);
  box-shadow: 0 0 7px rgba(255, 207, 92, 0.7);
}

.settings-tab-enter-active,
.settings-tab-leave-active {
  transition:
    opacity 0.22s var(--ease),
    transform 0.22s var(--ease);
}

.settings-tab-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.settings-tab-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 900px) {
  .settings-nav {
    width: 160px;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
