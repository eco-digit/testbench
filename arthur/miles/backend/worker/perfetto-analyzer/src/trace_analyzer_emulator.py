from perfetto.trace_processor import TraceProcessor
from autogluon.tabular import TabularDataset, TabularPredictor
import json
import pandas as pd

async def perform_analyze(trace_file_path):

    # Get all known CPU-States derived from calibration
    allCPUStates = {}
    print("Lade allCPUStates...")
    with open('/app/res/allCPUStates.json', 'r') as f:
        allCPUStates = json.loads(f.read())
    print("Performing analyzer...")
    
    perfettoData = getFeaturesFromTraceFile(trace_file_path)
    print(perfettoData)
    line = perfettoData["states"]

    dataset = []
    preparedMatrix = []
    for cpu in allCPUStates.keys():
        for freq in allCPUStates[cpu].keys():
            cpu_key = int(cpu)
            freq_key = float(freq)
            dataset.append(line.get(cpu_key, {}).get(freq_key, 0))

    preparedMatrix.append(dataset)
    dataset_df = pd.DataFrame(preparedMatrix)
    dataset_df.columns = dataset_df.columns.map(str)
    measurements = TabularDataset(dataset_df)
    predictor = TabularPredictor.load("/app/res/AutogluonModels")
    predictions = predictor.predict(measurements)

    time_in_seconds = perfettoData["time_in_seconds"]
    print("Laufzeit in Sekunden: ")
    print(time_in_seconds)
    total_energy = predictions[0]
    print("Wattsekunden: ")
    print(total_energy)

    return {"duration": float(time_in_seconds), "ws": float(total_energy)}


def getFeaturesFromTraceFile(trace_file_path):
    tp = TraceProcessor(trace=trace_file_path, addr='127.0.0.1:9001')
    raw_data = tp.query('select ts, cpu, value from counter as c left join cpu_counter_track as t on c.track_id = t.id where t.name = \'cpuidle\' or t.name = \'cpufreq\'')
    df_trace = raw_data.as_pandas_dataframe()

    time_in_seconds = (df_trace['ts'].max() - df_trace['ts'].min()) // 1000000 / 1000

    df_trace['ts'] = (df_trace['ts'] - df_trace['ts'].min()) / 1000 # Umrechnung in microsekunden seit start
    #print(df_trace)
    currentCoreState = {}
    aggregatedStats = {}

    for row in df_trace.itertuples():
        if currentCoreState.get(row.cpu) is None:
            currentCoreState[row.cpu] = {'freq': row.value, 'starttime': 0}
    for row in df_trace.itertuples():
        # Dictionaries initialisieren
        if aggregatedStats.get(row.cpu) is None:
            aggregatedStats[row.cpu] = {}
        if aggregatedStats[row.cpu].get(currentCoreState[row.cpu]['freq']) is None:
            aggregatedStats[row.cpu][currentCoreState[row.cpu]['freq']] = 0
        # Wenn sich der Zustand ändert, Zeit akkumulieren und Zustand aktualisieren
        if row.value != currentCoreState[row.cpu]['freq']:
            aggregatedStats[row.cpu][currentCoreState[row.cpu]['freq']] += row.ts - currentCoreState[row.cpu]['starttime']
            currentCoreState[row.cpu]['freq'] = row.value
            currentCoreState[row.cpu]['starttime'] = row.ts
    return {"states": aggregatedStats, "time_in_seconds": time_in_seconds}