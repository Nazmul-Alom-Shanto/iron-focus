function logsToPieChartList(data){
    const res = [];
    for(const log of data){
        const pie = {};
        pie.tags = Array.isArray(log.tags) ? log.tags : [];
        const duration = ((parseFloat(log?.givenTime) || 0) + (parseFloat(log?.extraAlocatedTime) || 0))/ 60;
        pie.duration = duration;
        if(pie.tags.length === 0) pie.tags = ["others"];
        res.push(pie);
    }
    return res;
}