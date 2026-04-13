import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING } from '../../../constants/theme';
import { GradientButton } from '../../../components/common/GradientButton';

const { height } = Dimensions.get('window');

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

export const BottomSheetDatePicker = ({ visible, onClose, onSelectDate, selectedDate }) => {
  const now = new Date();
  const [year, setYear] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[0]) : 1998
  );
  const [month, setMonth] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[1]) - 1 : 5
  );
  const [day, setDay] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[2]) : 11
  );

  const totalDays = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  // Build calendar grid
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= totalDays; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const rows = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    rows.push(calendarCells.slice(i, i + 7));
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleSave = () => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onSelectDate(`${year}-${m}-${d}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          <Text style={styles.sheetTitle}>Birthday</Text>

          {/* Year navigation */}
          <View style={styles.yearRow}>
            <TouchableOpacity
              onPress={() => setYear(y => y - 1)}
              style={styles.yearBtn}
            >
              <Icon name="chevron-back" size={22} color="#E4415C" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{year}</Text>
            <TouchableOpacity
              onPress={() => setYear(y => Math.min(y + 1, now.getFullYear() - 16))}
              style={styles.yearBtn}
            >
              <Icon name="chevron-forward" size={22} color="#E4415C" />
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
              <Icon name="chevron-back" size={18} color="#555" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{MONTHS[month]}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
              <Icon name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Day of week headers */}
          <View style={styles.weekDayRow}>
            {DAYS_OF_WEEK.map(d => (
              <Text key={d} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendar}>
            {rows.map((row, ri) => (
              <View key={ri} style={styles.weekRow}>
                {row.map((cell, ci) =>
                  cell === null ? (
                    <View key={ci} style={styles.dayCell} />
                  ) : (
                    <TouchableOpacity
                      key={ci}
                      onPress={() => setDay(cell)}
                      style={[
                        styles.dayCell,
                        day === cell && styles.dayCellSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          day === cell && styles.dayTextSelected,
                        ]}
                      >
                        {cell}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ))}
          </View>

          <GradientButton
            title="Save"
            onPress={handleSave}
            colors={['#E4415C', '#E4415C']}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.xl * 2,
    minHeight: height * 0.62,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D8D8D8',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 20,
  },
  yearBtn: {
    padding: 6,
  },
  yearText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E4415C',
    minWidth: 100,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  monthBtn: { padding: 6 },
  monthText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    minWidth: 110,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  weekDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#ABABAB',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  calendar: { marginBottom: SPACING.xl },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: { backgroundColor: '#E4415C' },
  dayText: {
    fontSize: 14,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  saveButton: { borderRadius: 16 },
});
