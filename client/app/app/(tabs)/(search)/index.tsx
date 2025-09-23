import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { searchVibes } from '~/api/vibes';
import TablerIconComponent from '~/components/icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 32 - 12) / 2; // 2 columns, 16px padding, 12px gap

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Toys', 'Home', 'Other'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchVibes({
        q: query,
        category: category !== 'All' ? category : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setResults(res.vibes || []);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  }, [query, category, minPrice, maxPrice]);

  // Search on mount or when filters change
  useEffect(() => {
    doSearch();
  }, [doSearch]);

  function handleSearch() {
    Keyboard.dismiss();
    doSearch();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-gruvbox-dark-bg0 pt-10">
        {/* Search Bar */}
        <View className="flex-row items-center px-4 pb-2 pt-8">
          <View className="flex-1 flex-row items-center rounded-xl bg-gruvbox-dark-bg2 px-3 py-2">
            <TablerIconComponent name="search" size={20} color="#a89984" />
            <TextInput
              className="ml-2 flex-1 text-gruvbox-light-bg0"
              placeholder="Search vibes, items, tags..."
              placeholderTextColor="#a89984"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <TablerIconComponent name="x" size={18} color="#a89984" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className="ml-3 rounded-xl bg-gruvbox-yellow-dark px-3 py-2"
            onPress={handleSearch}>
            <TablerIconComponent name="search" size={20} color="#282828" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="flex-row flex-wrap px-4 pb-2">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`mb-2 mr-2 rounded-full px-3 py-1 ${
                category === cat
                  ? 'bg-gruvbox-yellow-dark'
                  : 'border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2'
              }`}
              onPress={() => setCategory(cat)}>
              <Text
                className={`text-xs font-bold ${
                  category === cat ? 'text-gruvbox-dark-bg0' : 'text-gruvbox-light-bg0'
                }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Price Range */}
        <View className="flex-row items-center px-4 pb-2">
          <Text className="mr-2 text-xs text-gruvbox-dark-fg3">Price:</Text>
          <TextInput
            className="mr-2 w-16 rounded-lg bg-gruvbox-dark-bg2 px-2 py-1 text-xs text-gruvbox-light-bg0"
            placeholder="Min"
            placeholderTextColor="#a89984"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <Text className="mr-2 text-xs text-gruvbox-dark-fg3">-</Text>
          <TextInput
            className="mr-2 w-16 rounded-lg bg-gruvbox-dark-bg2 px-2 py-1 text-xs text-gruvbox-light-bg0"
            placeholder="Max"
            placeholderTextColor="#a89984"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
          <TouchableOpacity
            className="rounded-lg bg-gruvbox-yellow-dark px-3 py-1"
            onPress={handleSearch}>
            <Text className="text-xs font-bold text-gruvbox-dark-bg0">Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#fabd2f" />
          </View>
        ) : results.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gruvbox-yellow-dark">No vibes found.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="overflow-hidden rounded-2xl bg-gruvbox-dark-bg1/90"
                style={{ width: CARD_SIZE }}
                activeOpacity={0.9}
                // onPress={() => ... navigate to detail if you want
              >
                <Image
                  source={
                    item.mediaFiles?.[0]
                      ? { uri: item.mediaFiles[0].url }
                      : require('~/assets/oldvibes-small.png')
                  }
                  className="h-40 w-full"
                  resizeMode="cover"
                />
                <View className="p-2">
                  <Text className="font-bold text-gruvbox-yellow-dark" numberOfLines={1}>
                    {item.itemName}
                  </Text>
                  <Text className="text-xs text-gruvbox-dark-fg3" numberOfLines={1}>
                    ${item.price}
                  </Text>
                  <Text className="text-xs text-gruvbox-dark-fg4" numberOfLines={1}>
                    {item.category}
                  </Text>
                  <View className="mt-1 flex-row flex-wrap">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Text
                        key={tag}
                        className="mb-1 mr-1 rounded-full bg-gruvbox-dark-bg3 px-2 py-0.5 text-[10px] text-gruvbox-yellow-dark">
                        #{tag}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
