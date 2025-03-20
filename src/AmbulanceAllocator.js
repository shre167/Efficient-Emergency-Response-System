import React, { useState } from "react";
import { motion } from "framer-motion";
import "./styles.css";

const AmbulanceAllocator = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [numEmergencies, setNumEmergencies] = useState(0);
  const [sortingSteps, setSortingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [ambulances, setAmbulances] = useState(0);
  const [allocated, setAllocated] = useState([]);
  const [waitingList, setWaitingList] = useState([]);

  const handleEmergencyInput = (index, field, value) => {
    const newEmergencies = [...emergencies];
    newEmergencies[index][field] = Number(value);
    setEmergencies(newEmergencies);
  };

  const handleStart = () => {
    const initialEmergencies = Array.from({ length: numEmergencies }, (_, i) => ({
      id: i + 1,
      severity: "",
      distance: ""
    }));
    setEmergencies(initialEmergencies);
  };

  const swap = (arr, i, j) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return [...arr];
  };

  const quickSort = (arr) => {
    let steps = [];

    const partition = (low, high) => {
      let pivot = arr[high]; // Pivot is the last element
      let i = low - 1; // Index for the smaller element

      // Log the pivot selection
      steps.push({
        array: [...arr],
        swapped: [],
        pivotIndex: high,
        explanation: `Pivot selected: Emergency ${pivot.id} (Severity: ${pivot.severity}, Distance: ${pivot.distance})`
      });

      for (let j = low; j < high; j++) {
        if (arr[j].severity > pivot.severity) {
          i++;
          if (i !== j) {
            arr = swap([...arr], i, j);
            // Log the swap due to higher severity
            steps.push({
              array: [...arr],
              swapped: [i, j],
              pivotIndex: high,
              explanation: `Swapped Emergency ${arr[i].id} and Emergency ${arr[j].id} because Emergency ${arr[j].id} has higher severity (${arr[j].severity} > ${pivot.severity})`
            });
          }
        } else if (arr[j].severity === pivot.severity && arr[j].distance < pivot.distance) {
          i++;
          if (i !== j) {
            arr = swap([...arr], i, j);
            // Log the swap due to shorter distance
            steps.push({
              array: [...arr],
              swapped: [i, j],
              pivotIndex: high,
              explanation: `Swapped Emergency ${arr[i].id} and Emergency ${arr[j].id} because they have the same severity (${arr[j].severity}), but Emergency ${arr[j].id} has a shorter distance (${arr[j].distance} < ${pivot.distance})`
            });
          }
        }
      }

      // Place the pivot in its correct position
      if (i + 1 !== high) {
        arr = swap([...arr], i + 1, high);
        // Log the pivot placement and swap
        steps.push({
          array: [...arr],
          swapped: [i + 1, high],
          pivotIndex: i + 1,
          explanation: `Swapped Emergency ${arr[i + 1].id} and Emergency ${arr[high].id} to place pivot (Emergency ${pivot.id}) in its correct position at index ${i + 1}`
        });
      } else {
        // Log if no swap was needed for pivot placement
        steps.push({
          array: [...arr],
          swapped: [],
          pivotIndex: i + 1,
          explanation: `Pivot (Emergency ${pivot.id}) is already in its correct position at index ${i + 1}`
        });
      }

      return i + 1; // Return the partition index
    };

    const sort = (low, high) => {
      if (low < high) {
        let pi = partition(low, high); // Partition the array
        sort(low, pi - 1); // Sort the left sub-array
        sort(pi + 1, high); // Sort the right sub-array
      }
    };

    sort(0, arr.length - 1); // Start sorting
    return steps;
  };

  const handleSort = () => {
    const sortedSteps = quickSort([...emergencies]);
    setSortingSteps(sortedSteps);
    setCurrentStep(0);
  };

  const handleAmbulanceAllocation = () => {
    let sorted = sortingSteps[sortingSteps.length - 1].array;
    let assigned = sorted.slice(0, ambulances); // Allocate ambulances to the highest priority emergencies
    let waiting = sorted.slice(ambulances); // Remaining emergencies go to the waiting list
    setAllocated(assigned);
    setWaitingList(waiting);
  };

  return (
    <div className="container">
      <h1>Emergency Response System🚨</h1>
      <input type="number" placeholder="Enter number of emergencies" onChange={(e) => setNumEmergencies(Number(e.target.value))} />
      <button onClick={handleStart}>Start</button>
      {emergencies.length > 0 && (
        <div>
          {emergencies.map((em, index) => (
            <div key={index} className="input-group">
              <input type="number" placeholder="Severity" onChange={(e) => handleEmergencyInput(index, "severity", e.target.value)} />
              <input type="number" placeholder="Distance" onChange={(e) => handleEmergencyInput(index, "distance", e.target.value)} />
            </div>
          ))}
          <button onClick={handleSort}>Sort Emergencies</button>
        </div>
      )}
      {sortingSteps.length > 0 && (
        <div className="sorting-steps">
          <h2>Sorting Steps</h2>
          <button disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>← Previous</button>
          <button disabled={currentStep === sortingSteps.length - 1} onClick={() => setCurrentStep(currentStep + 1)}>Next →</button>
          <div className="step-explanation">
            <h3>Step {currentStep + 1}:</h3>
            <p>{sortingSteps[currentStep].explanation}</p>
          </div>
          <div className="card-list">
            {sortingSteps[currentStep].array.map((em, idx) => (
              <motion.div 
                key={idx} 
                className={`card ${idx === sortingSteps[currentStep].pivotIndex ? "pivot" : "sorting-card"}`} 
                animate={{ 
                  x: sortingSteps[currentStep].swapped.includes(idx) ? [0, -10, 10, 0] : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <p>ID: {em.id}</p>
                <p>Severity: {em.severity}</p>
                <p>Distance: {em.distance}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {sortingSteps.length > 0 && currentStep === sortingSteps.length - 1 && (
        <div>
          <div className="final-sorted-section">
            <h2>Final Sorted Emergencies</h2>
            <div className="card-list">
              {sortingSteps[currentStep].array.map((em, idx) => (
                <motion.div 
                  key={idx} 
                  className="card final-card" 
                  style={{ backgroundColor: `hsl(${(em.severity / 10) * 360}, 70%, 50%)` }} // Dynamic color based on severity
                >
                  <p>ID: {em.id}</p>
                  <p>Severity: {em.severity}</p>
                  <p>Distance: {em.distance}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="allocate-section">
            <input type="number" placeholder="Enter number of ambulances" onChange={(e) => setAmbulances(Number(e.target.value))} />
            <button onClick={handleAmbulanceAllocation}>Allocate Ambulances</button>
            <h2>Ambulance Allocation🚑</h2>
            <div className="ambulance-allocation-cards">
              {allocated.map((em, index) => (
                <motion.div key={index} className="card allocated" animate={{ opacity: 1, scale: 1.1 }}>
                  <p>Ambulance {index + 1} → Emergency {em.id}</p>
                </motion.div>
              ))}
            </div>
            <h2>Waiting List</h2>
            <div className="waiting-list-cards">
              {waitingList.map((em, index) => (
                <motion.div key={index} className="card waiting" animate={{ opacity: 0.7 }}>
                  <p>Emergency {em.id} is waiting</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceAllocator;