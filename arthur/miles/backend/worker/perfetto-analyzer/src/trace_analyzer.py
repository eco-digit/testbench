from perfetto.trace_processor import TraceProcessor
import json


def set_nullpoint(rail):
    rail = rail.sort_values('ts')
    base = rail['value'].iloc[0]
    rail['value'] = rail['value'].apply(lambda x: x-base)
    return rail


async def perform_analyze(trace_file_path):
    print("Performing analyzer...")
    tp = TraceProcessor(trace=trace_file_path, addr='127.0.0.1:9001')
    qr_it = tp.query('SELECT ts, value, name, track_id FROM counters WHERE track_id <= 15')
    df = qr_it.as_pandas_dataframe()

    # Nur die Namen filtern (und später betrachten), die mit "power." beginnen
    track_names = df[df['name'].str.startswith('power.')]['name'].unique()
    tracks = {}

    for track_id, track_name in enumerate(track_names):
        track = df.loc[df['track_id'] == track_id]
        track = set_nullpoint(track)
        # Zeit in Millisekunden umwandeln
        track['ts'] = (track['ts'] // 1000000).astype(int)
        tracks[track_name] = track

    print(len(tracks))

    sums = []
    for track_name in track_names:
        sums.append(tracks[track_name]['value'].iloc[-1])

    time_in_seconds = (tracks[track_names[0]]['ts'].iloc[-1] - tracks[track_names[0]]['ts'].iloc[0]) / 1000
    print("Laufzeit in Sekunden: ")
    print(time_in_seconds)
    total_energy = sum(sums)
    print("Wattsekunden: ")
    print(total_energy/1000/1000)

    return {"duration": float(time_in_seconds), "ws": float(total_energy/1000/1000)}

