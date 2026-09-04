import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <View style={styles.container}>
      <Button
        title="Previous"
        disabled={currentPage <= 1}
        onPress={() => onPageChange(currentPage - 1)}
      />

      <Text style={styles.label}>
        {currentPage} / {totalPages}
      </Text>

      <Button
        title="Next"
        disabled={currentPage >= totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});