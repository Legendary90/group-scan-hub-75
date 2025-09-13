import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  features: string[];
  fixes: string[];
  isRequired: boolean;
}

export const UpdateNotification = ({ onDismiss }: { onDismiss: () => void }) => {
  const [updateInfo] = useState<UpdateInfo>({
    version: "2.1.0",
    releaseDate: "2024-01-15",
    features: [
      "Enhanced balance sheet generation",
      "Improved mobile responsiveness", 
      "Advanced security features",
      "Better performance optimization",
      "New dark theme enhancements"
    ],
    fixes: [
      "Fixed data synchronization issues",
      "Resolved printing layout problems",
      "Enhanced error handling",
      "Improved loading performance"
    ],
    isRequired: false
  });

  const handleDownloadUpdate = () => {
    // In a real application, this would trigger the update process
    alert("Update download started. Please check your downloads folder.");
    onDismiss();
  };

  const handleSkipUpdate = () => {
    localStorage.setItem('skipped_update_version', updateInfo.version);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">InviX Update Available</CardTitle>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Version {updateInfo.version}</Badge>
            <Badge variant={updateInfo.isRequired ? "destructive" : "default"}>
              {updateInfo.isRequired ? "Required" : "Optional"}
            </Badge>
          </div>
          <p className="text-slate-400">Released on {new Date(updateInfo.releaseDate).toLocaleDateString()}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* New Features */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              New Features
            </h3>
            <ul className="space-y-2">
              {updateInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Bug Fixes */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
              <AlertCircle className="h-5 w-5" />
              Bug Fixes & Improvements
            </h3>
            <ul className="space-y-2">
              {updateInfo.fixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  {fix}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleDownloadUpdate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Update
            </Button>
            {!updateInfo.isRequired && (
              <Button 
                onClick={handleSkipUpdate}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Skip This Version
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-slate-400">
            <p>The update will be downloaded as InviX Setup.exe</p>
            <p>Your data will be preserved during the update process</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};