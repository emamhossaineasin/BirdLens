import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'
import { BarChart } from "react-native-chart-kit";

const Chart = (props) => {
    const screenWidth = Dimensions.get('window').width;
    let averageRating = Math.ceil(
        ((1 * props.data.one_star) +
            (2 * props.data.two_star) +
            (3 * props.data.three_star) +
            (4 * props.data.four_star) +
            (5 * props.data.five_star)) /
        (props.data.one_star +
            props.data.two_star +
            props.data.three_star +
            props.data.four_star +
            props.data.five_star)
    );
    if(props.data.one_star===0 && props.data.two_star===0 && props.data.three_star===0 && props.data.four_star===0 && props.data.five_star===0){
        averageRating = 0
    }
    // console.log(averageRating)
    const Remark = ["Not Rated Yet","Unacceptable", "Below Par", "Adequate", "Impressive", "Exceptional"]
    const data = {
        labels: ["One Star", "Two Star", "Three Star", "Four Star", "Five Star"],
        datasets: [
            {
                data: [props.data.one_star, props.data.two_star, props.data.three_star, props.data.four_star, props.data.five_star]
            }
        ]
    };

    const chartConfig = {
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#FFFFFF",
        backgroundGradientToOpacity: 0,
        color: (opacity = 0) => `rgba(0,0,0, ${opacity})`,
        strokeWidth: 5, // optional, default 3
        barPercentage: 1.2,
        useShadowColorFromDataset: false // optional
    };

    return (
        <View style={styles.container}>
            <View style={styles.headingView}>
                <Text style={styles.heading}>{'Course Title : ' + props.data.course_title}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.dText}>The following graph depicts the rating stats of this course. It shows the number of ratings from 1 star to 5 star : </Text>
            </View>
            <View style={styles.barChart}>
                <BarChart
                    //style={graphStyle}
                    data={data}
                    width={screenWidth}
                    height={255}
                    yAxisLabel=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    showValuesOnTopOfBars={true}
                />
            </View>
            <Text style={styles.remark}>{'Remark, based on average rating : '+ Remark[averageRating]}</Text>
        </View>
    )
}

export default Chart

const styles = StyleSheet.create({
    container: {
        width: '95%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    barChart: {
        marginTop: 20,
    },
    heading: {
        fontSize: 22,
        color: 'crimson'
    },
    headingView: {
        width: '100%',
        alignItems: 'flex-start',
        marginTop: 15
    },
    details: {
        marginTop: 20,
        width: '100%'
    },
    dText: {
        fontSize: 16
    },
    remark : {
        fontSize : 15,
        fontWeight : 'bold',
        marginTop : 20
    }
})