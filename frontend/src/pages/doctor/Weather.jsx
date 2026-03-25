import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import InsightCard from '../../components/ui/InsightCard';
import { Cloud, Sun, CloudRain } from 'lucide-react';
import { format } from 'date-fns';

const Weather = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await api.get('/weather');
        setForecast(res.data.data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getIcon = (temp, humidity) => {
    if (humidity > 70) return <CloudRain className="w-8 h-8 text-primary" />;
    if (temp > 25) return <Sun className="w-8 h-8 text-warning" />;
    return <Cloud className="w-8 h-8 text-textSecondary" />;
  };

  const highAqiDay = forecast.find(day => day.aqi > 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Environmental Health Surveillance</h1>
        <p className="text-textSecondary">Monitor epidemiological risks based on local weather patterns.</p>
      </div>

      {highAqiDay && (
        <InsightCard
          type="warning"
          message={`Clinical Alert: AQI is projected to hit ${highAqiDay.aqi} on ${format(new Date(highAqiDay.date), 'EEEE')}. Automated alerts have been dispatched to 24 of your patients with registered respiratory conditions based on these parameters.`}
        />
      )}

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
        {loading ? (
          <p className="text-textSecondary">Loading forecast...</p>
        ) : (
          forecast.map((day, idx) => (
            <GlassCard key={idx} className="p-6 min-w-[200px] flex-shrink-0 snap-start flex flex-col items-center">
              <span className="text-sm font-medium text-textSecondary mb-4">
                {format(new Date(day.date), 'EEE, MMM d')}
              </span>
              <div className="mb-4">
                {getIcon(day.temp, day.humidity)}
              </div>
              <div className="text-3xl font-bold text-textPrimary mb-1">{day.temp}°C</div>
              
              <div className="w-full mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary">Humidity</span>
                  <span className="font-medium text-textPrimary">{day.humidity}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary">AQI</span>
                  <span className={`font-medium ${day.aqi > 100 ? 'text-warning' : 'text-success'}`}>
                    {day.aqi}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Weather;
