<template>
  <aside class="filter">
    <div class="filter__rooms">
      <div class="filter__rooms-buttons">
        <button
          v-for="room in roomOptions"
          :key="room"
          class="filter__room-btn"
          :class="{ 'filter__room-btn--active': selectedRooms.includes(room) }"
          @click="toggleRoom(room)"
        >
          {{ room }}к
        </button>
      </div>
    </div>

    <div class="filter__section">
      <h3 class="filter__title">Стоимость квартиры, ₽</h3>
      <div class="filter__range">
        <span class="filter__range-label">от {{ formatPrice(priceRange[0]) }}</span>
        <span class="filter__range-label">до {{ formatPrice(priceRange[1]) }}</span>
      </div>
      <div class="filter__slider-container">
        <input
          v-model.number="priceRange[0]"
          type="range"
          :min="minPrice"
          :max="maxPrice"
          :step="10000"
          class="filter__slider"
          @input="onPriceChange"
        >
        <input
          v-model.number="priceRange[1]"
          type="range"
          :min="minPrice"
          :max="maxPrice"
          :step="10000"
          class="filter__slider"
          @input="onPriceChange"
        >
      </div>
    </div>

    <div class="filter__section">
      <h3 class="filter__title">Площадь, м²</h3>
      <div class="filter__range">
        <span class="filter__range-label">от {{ areaRange[0] }}</span>
        <span class="filter__range-label">до {{ areaRange[1] }}</span>
      </div>
      <div class="filter__slider-container">
        <input
          v-model.number="areaRange[0]"
          type="range"
          :min="minArea"
          :max="maxArea"
          :step="1"
          class="filter__slider"
          @input="onAreaChange"
        >
        <input
          v-model.number="areaRange[1]"
          type="range"
          :min="minArea"
          :max="maxArea"
          :step="1"
          class="filter__slider"
          @input="onAreaChange"
        >
      </div>
    </div>

    <button
      class="filter__reset"
      @click="resetFilters"
    >
      Сбросить параметры
    </button>
  </aside>
</template>

<script setup lang="ts">
const apartmentsStore = useApartmentsStore()

const roomOptions = [1, 2, 3, 4]
const selectedRooms = ref<number[]>([])

const priceRange = ref<[number, number]>([5500000, 18900000])
const areaRange = ref<[number, number]>([33, 123])

const minPrice = computed(() => apartmentsStore.priceRange[0] || 5500000)
const maxPrice = computed(() => apartmentsStore.priceRange[1] || 18900000)
const minArea = computed(() => apartmentsStore.areaRange[0] || 33)
const maxArea = computed(() => apartmentsStore.areaRange[1] || 123)

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU').format(price)
}

const toggleRoom = (room: number) => {
  const index = selectedRooms.value.indexOf(room)
  if (index > -1) {
    selectedRooms.value.splice(index, 1)
  } else {
    selectedRooms.value.push(room)
  }
  updateFilters()
}

const onPriceChange = () => {
  if (priceRange.value[0] > priceRange.value[1]) {
    const temp = priceRange.value[0]
    priceRange.value[0] = priceRange.value[1]
    priceRange.value[1] = temp
  }
  updateFilters()
}

const onAreaChange = () => {
  if (areaRange.value[0] > areaRange.value[1]) {
    const temp = areaRange.value[0]
    areaRange.value[0] = areaRange.value[1]
    areaRange.value[1] = temp
  }
  updateFilters()
}

const updateFilters = () => {
  apartmentsStore.updateFilter({
    rooms: selectedRooms.value,
    priceRange: priceRange.value,
    areaRange: areaRange.value
  })
}

const resetFilters = () => {
  selectedRooms.value = []
  priceRange.value = [minPrice.value, maxPrice.value]
  areaRange.value = [minArea.value, maxArea.value]
  apartmentsStore.resetFilters()
}
</script>

<style lang="scss" scoped>
.filter {
  background-color: #E8F5E8;
  border-radius: 12px;
  padding: 24px;

  @media (max-width: 960px) {
    margin-bottom: 24px;
  }

  &__rooms {
    margin-bottom: 48px;
  }

  &__rooms-buttons {
    display: flex;
    gap: 12px;
  }

  &__room-btn {
    flex: 1;
    min-height: 44px;
    padding: 12px;
    border: 1px solid #2E8B57;
    border-radius: 50%;
    background-color: #FFFFFF;
    color: #2E8B57;
    font-family: 'PT Root UI', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #2E8B57;
      color: #FFFFFF;
    }

    &--active {
      background-color: #2E8B57;
      color: #FFFFFF;
    }

    &:focus {
      outline: 2px solid #2E8B57;
      outline-offset: 2px;
    }
  }

  &__section {
    margin-bottom: 48px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 400;
    color: #1A1A1A;
    margin-bottom: 16px;
  }

  &__range {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__range-label {
    font-size: 14px;
    color: #6B6B6B;
  }

  &__slider-container {
    position: relative;
    margin: 16px 0;
  }

  &__slider {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: #D1D5DB;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    margin: 8px 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2E8B57;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2E8B57;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      border: none;
    }

    &::-webkit-slider-track {
      width: 100%;
      height: 4px;
      background: #D1D5DB;
      border-radius: 2px;
    }

    &::-moz-range-track {
      width: 100%;
      height: 4px;
      background: #D1D5DB;
      border-radius: 2px;
      border: none;
    }

    &:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.3);
    }
  }

  &__reset {
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    color: #6B6B6B;
    font-family: 'PT Root UI', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s ease;

    &:hover {
      color: #1A1A1A;
    }

    &:focus {
      outline: 2px solid #2E8B57;
      outline-offset: 2px;
    }
  }
}
</style>
